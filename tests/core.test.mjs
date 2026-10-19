import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

// Use the app's module loader so JSX and ESM follow the same rules as development.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom"
});
after(() => server.close());

const { Camera } = await server.ssrLoadModule("/src/components/spatial/Camera.js");
const { combinePose, pose } = await server.ssrLoadModule("/src/components/spatial/position.js");
const { degToRad, radToDeg, coordsToPath, appendLastPoint, shiftPolylinePath } =
  await server.ssrLoadModule("/src/dragon/math.js");
const { createInitialDragonState } = await server.ssrLoadModule("/src/dragon/state.js");
const { compose, compoundFunction, recipe } = await server.ssrLoadModule("/src/compound/index.js");

test("camera projects relative to its position without changing world coordinates", () => {
  const point = { x: 14, y: 24, z: 7 };
  const camera = new Camera({ position: { x: 10, y: 20, z: 2 }, focalLength: 10 });
  assert.deepEqual(camera.project(point), { x: 8, y: 8, scale: 2, depth: 5 });
  assert.deepEqual(point, { x: 14, y: 24, z: 7 });
});

test("camera culls pieces at or behind its near plane", () => {
  const camera = new Camera({ position: { x: 0, y: 0, z: 1 }, near: 0.5 });
  for (const z of [-1, 1, 1.5]) {
    assert.equal(camera.project({ x: 10, y: 20, z }), null);
  }
  assert.ok(camera.project({ x: 10, y: 20, z: 1.6 }));
});

test("group poses rotate and scale XY while adding continuous depth", () => {
  const parent = pose({ x: 100, y: 50, z: 2 }, 90, 2);
  const child = pose({ x: 10, y: 0, z: 0.25 }, 15, 0.5);
  const combined = combinePose(parent, child);
  assert.ok(Math.abs(combined.position.x - 100) < 1e-10);
  assert.ok(Math.abs(combined.position.y - 70) < 1e-10);
  assert.equal(combined.position.z, 2.25);
  assert.equal(combined.rotation, 105);
  assert.equal(combined.scale, 1);
  assert.equal(child.position.x, 10);
});

test("degree conversion preserves signed headings in all quadrants", () => {
  for (const [x, y, expected] of [[1, 1, 45], [-1, 1, 135], [-1, -1, -135], [1, -1, -45]]) {
    assert.equal(radToDeg(Math.atan2(y, x)), expected);
  }
  assert.equal(radToDeg(degToRad(-90)), -90);
});

test("polyline helpers retain negative coordinates when appending and shifting", () => {
  const points = [[-10, -20], [0, 5], [10, -5]];
  const path = coordsToPath(points.slice(0, 2));
  assert.equal(path, "M -10 -20 L 0 5");
  assert.equal(shiftPolylinePath(appendLastPoint(path, points)), "M 0 5 L 10 -5");
  assert.equal(coordsToPath([]), "");
});

test("initial dragon state is independent for each instance", () => {
  const first = createInitialDragonState();
  const second = createInitialDragonState();
  first.lineCoords[0][0] = 99;
  assert.equal(second.lineCoords[0][0], 0);
  assert.equal(second.displayPath, coordsToPath(second.lineCoords));
});

test("compound classes preserve base construction and isolate instance parts", () => {
  class Base {
    constructor(name) { this.name = name; }
  }
  class Part {
    constructor(owner) { this.owner = owner; }
  }
  const Compound = compose(Base)()
    .part("motion", Part)
    .body((self) => ({ describe: () => self.name }))
    .build();
  const first = new Compound("first");
  const second = new Compound("second");
  assert.equal(first.getPart("motion").owner, first);
  assert.notEqual(first.getPart("motion"), second.getPart("motion"));
  assert.equal(first.describe(), "first");
  assert.equal(first.render(), null);
});

test("compound functions keep separate closures and call their supplied continuation", () => {
  const wrap = compoundFunction((alpha) => {
    let calls = 0;
    return (value) => alpha(value + ++calls);
  });
  const first = wrap((value) => value * 2);
  const second = wrap((value) => value * 3);
  assert.equal(first(10), 22);
  assert.equal(first(10), 24);
  assert.equal(second(10), 33);
});

test("recipes execute transforms in declaration order before the final continuation", () => {
  const run = recipe()
    .through(2, (amount) => (value) => value + amount)
    .through(3, (factor) => (value) => value * factor)
    .build((value) => `result:${value}`);
  assert.equal(run(4), "result:18");
});

test("nested coordinate systems match successive parent-child transforms", () => {
  const world = pose({ x: 100, y: 50, z: 1.25 }, 90, 2);
  const group = pose({ x: 10, y: 0, z: 0.5 }, -90, 0.5);
  const leaf = pose({ x: 3, y: 4, z: 0.125 }, 30, 3);
  const nested = combinePose(combinePose(world, group), leaf);
  const accumulated = combinePose(world, combinePose(group, leaf));
  for (const axis of ["x", "y", "z"]) {
    assert.ok(Math.abs(nested.position[axis] - accumulated.position[axis]) < 1e-10);
  }
  assert.ok(Math.abs(nested.position.x - 103) < 1e-10);
  assert.ok(Math.abs(nested.position.y - 74) < 1e-10);
  assert.equal(nested.position.z, 1.875);
  assert.equal(nested.rotation, 30);
  assert.equal(nested.scale, 3);
});

test("a Part-owned beta captures context and exposes only the supplied alpha capability", () => {
  class DepthPart {
    constructor(z) { this.z = z; }

    apply(alpha) {
      const z = this.z;
      return (t) => ({ ...alpha(t), z });
    }
  }
  const first = new DepthPart(1.5);
  const second = new DepthPart(2.75);
  let calls = 0;
  const spatialPosition = first.apply((t) => {
    calls += 1;
    return { x: t * 10, y: 0 };
  });
  const otherPosition = compoundFunction((alpha) => second.apply(alpha))(
    (t) => ({ x: t, y: -t })
  );
  assert.deepEqual(spatialPosition(2), { x: 20, y: 0, z: 1.5 });
  assert.deepEqual(spatialPosition(3), { x: 30, y: 0, z: 1.5 });
  assert.deepEqual(otherPosition(4), { x: 4, y: -4, z: 2.75 });
  assert.equal(calls, 2);
});

test("compound orchestration connects independent Parts through a narrow capability", () => {
  class MathPart {
    point(t) { return { x: t * 2, y: t * 3 }; }
  }
  class GraphicsPart {
    describe(alpha) {
      return (t) => ({ position: alpha(t), graphic: "body" });
    }
  }
  const Entity = compose()()
    .part("math", MathPart)
    .part("graphics", GraphicsPart)
    .body((self) => ({
      describe: self.getPart("graphics").describe((t) => self.getPart("math").point(t))
    }))
    .build();
  const entity = new Entity();
  assert.deepEqual(entity.describe(4), { position: { x: 8, y: 12 }, graphic: "body" });
  assert.equal(entity.getPart("graphics").math, undefined);
});
