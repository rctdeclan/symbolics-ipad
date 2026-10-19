# Symbolics v3

Symbolics is a 2.5D SVG game experiment. v3 keeps the v2 dragon formula/debug work and formalizes spatial positioning, camera projection, Compound Classes, and official Compound Functions.

## Install

```bash
npm ci
npm run dev
```

`node_modules` is intentionally not included. `package.json` and `package-lock.json` describe the install. v3 adds no new npm dependencies.

Use the Node version in `.nvmrc` (`nvm use` if nvm is installed).
Run `npm run check` for the production build, core tests, and headless HTTP
smoke checks. There is no configured TypeScript or lint command. These checks
do not replace browser or iPadOS/Safari validation.

For Mac/Cloud Git synchronization, commands and platform limitations, see
[AGENTS.md](AGENTS.md). For the current implementation and known gaps, read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The longer
[v3 design document](SYMBOLICS_V3_ARCHITECTURE.md) also includes future APIs.

## Spatial model

- `Position { x, y, z }` is a continuous world position. `z` may be `1.5`, `2.73`, etc.
- `Spatial` is one indivisible flat SVG graphic at one depth.
- `SpatialGroup` is a coordinate system. It transforms descendant `Spatial` leaves but is not itself an SVG `<g>` and does not force its children to share drawing order.
- `Camera` owns perspective. Moving `camera.position.x/y/z` moves the observer.
- `SpatialScene` collects all `Spatial` leaves, projects them through the camera, and sorts them far-to-near before painting SVG.
- `Layer` remains a time/composition concept; it is not a depth layer.

Example:

```jsx
<SpatialGroup position={{ x: 100, y: 50, z: 2 }}>
  <Body position={{ x: 0, y: 0, z: 0 }} />
  <Body position={{ x: 10, y: 2, z: 0.25 }} />
</SpatialGroup>
```

A `Body` should render its graphics through a `Spatial`. Each Body can therefore be globally ordered against cave pieces even though the Bodies share a parent `SpatialGroup`.

## Compound Classes

`src/compound/compound.jsx` provides the TGO-style structural builder:

```js
const Dragon = compose(BaseDragon)()
  .part("math", DragonMathPart)
  .part("graphics", DragonGraphicsPart)
  .body(self => ({ update() { /* orchestration */ } }))
  .view(DragonView)
  .build();
```

This keeps mathematical state/behavior separate from graphics.

## Official Compound Functions

A Compound Function is an α→β→γ recipe. α is supplied inline to β. β owns/captures its concern's closure and returns γ. γ calls α. The resulting γ is the reusable recipe.

```js
const useCorrection = compoundFunction(alpha => {
  const strength = 0.5; // β closure
  return target => {    // γ
    const corrected = { ...target, x: target.x * strength };
    return alpha(corrected); // γ always calls α
  };
});

const navigate = useCorrection(
  target => target // α supplied inline
);
```

`recipe().through(...).build()` is optional daisy-chain sugar for the simple transform case. It constructs nested closures right-to-left rather than sharing one mutable pipeline closure.

## v2 compatibility

`G3` remains as a compatibility adapter but now delegates to `Spatial`. New code should prefer `Spatial` and `SpatialGroup` directly.
