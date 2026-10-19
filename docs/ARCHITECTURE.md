# Implemented Architecture and Project Knowledge

This describes the source at the Cloud preparation commit. The larger
[Symbolics v3 design](../SYMBOLICS_V3_ARCHITECTURE.md) remains the design record,
including future examples. It is not a declaration that every feature exists.

The established Symbolics v3 principles also apply under the `symbolics-ipad`
name. The decision records below record those principles and current source
evidence; they do not invent dates or details of earlier discussions.

## Decision records and implementation status

See [the decision index](decisions/README.md), specifically
[Compound Classes](decisions/0001-compound-classes.md),
[Compound Functions](decisions/0002-compound-functions.md),
[spatial relationships](decisions/0003-spatial-relationships.md), and
[math/graphics separation](decisions/0004-math-graphics-rendering.md).

| Concern | Implemented | Established requirement not yet implemented | Unresolved |
| --- | --- | --- | --- |
| Compound Classes | Builder, Parts, orchestration and view hooks | Migrate new substantial concerns to independent Parts; live Dragon is still a function component | React update/subscription strategy for mutable Parts |
| Compound Functions | `compoundFunction` primitive and closure-based `recipe` shorthand | Part-owned beta method, inline alpha, reusable gamma in feature compositions | No additional composition syntax is agreed here |
| Spatial relationships | Spatial leaves, SpatialGroup, local/world pose composition | Generic paths/poses remain independent of Body graphics | SpatialPath API, sampling and ownership |
| Camera/rendering | Translation, perspective, near culling, global depth sort | Preserve world/camera/geometry separation | Whether/how to add camera orientation; no orientation API exists |
| Line/body conversion | Numerical line tuples, debug path, inactive Body/Head graphics | Separate mathematical samples/body poses from SVG shape geometry | Body-coordinate schema, arc-length sampling and per-body depth |

Requirements are binding design direction, not claims that the unfinished code
already satisfies them. Do not implement an open API implicitly in documentation.

## Scope and repository map

Symbolics is a 2.5D SVG game/animation experiment. The current screen is a
dragon trajectory debug study, not a complete game. The repository is named
`symbolics-ipad`; the npm package is `symbolics-v3` version `0.3.0`.
The intended iPad runtime is Safari on iPadOS. The Mac and Codex Cloud are
development hosts for that same browser application. References to Linux
describe Cloud's development tools, not an alternative application platform.

| Location | Role/status |
| --- | --- |
| `index.html`, `src/main.jsx` | Browser entry and React StrictMode mount. |
| `src/App.jsx` | Scene assembly, camera instance, app timeline, historical comments. |
| `src/components/scene/` | Stage viewport, composition time, temporal layers, G3 adapter. |
| `src/components/spatial/` | World pose composition, registration, projection, depth sorting. |
| `src/Dragon.jsx` | Live trajectory formulas/debug view plus inactive navmesh and body artwork. |
| `src/dragon/` | Initial state, path/angle helpers, axes and diagnostic SVG. |
| `src/compound/` | Implemented composition primitives; not wired into the live Dragon. |
| `src/use*.jsx` | Animation, proxy state, mouse tracking, and timeout hooks. |
| `src/bezier-spline.jsx` | Older spline sampling utilities, not used by the live app. |
| `src/archive/` | Historical approaches, comments and artwork; not a supported build target. |
| `assets/` | SVG originals/exports and binary Vectornator artwork; not imported by the entry. |
| `public/` | Static icons, robots.txt and legacy web manifest, copied by Vite. |
| `c/` | Independent MiniLibX sketches and language/editor design notes. |
| `pseudo.md` | Historical ideas: gaze, music, splines and perspective; not implemented features. |
| `.vscode/`, `c/.vscode/` | Generated C compiler/debug tasks, not web build instructions. |
| `tests/core.test.mjs`, `scripts/smoke.mjs` | Headless numerical/contract and HTTP checks. |

There is no backend, database, authentication, networking service, native iPad
target, or configured CI workflow. No environment variables/secrets are needed
by the live entry graph. The original import commit is `28e04f2`.

## Actual rendering path

```text
index.html -> main.jsx -> App
  Stage: SVG, white background, centered origin, clipping
    Composition: animation time/delta -> SpatialScene
      Layer: time gate -> Dragon
        proxy state + requestAnimationFrame -> debug SVG -> G3 -> Spatial
      registered Spatial pieces -> Camera.project -> near-plane cull
        -> global far-to-near sort -> transformed SVG <g> elements
```

`Stage` is 1280x720 in App and uses a hard-coded centered clip rectangle of
the same dimensions. Browser SVG coordinates have positive Y downward.
`App` and `Composition` currently own separate animation hooks. Composition
and Layer clone children to pass time/delta; Layer overrides the Dragon's
time/delta props. Layer intervals are inclusive, unless `continuous` is true.
The Dragon also schedules its own updates and does not scale movement by delta.

`Spatial` returns null where it is declared. In a layout effect it registers
`{ id, pose, element }` with the surrounding scene and returns an unregister
cleanup. The scene stores registrations in a Map and renders their elements
later. The provider still renders semantic children so those effects can run.
Maintain registration/cleanup symmetry under StrictMode and stable register
callbacks. The default context register is a no-op: a Spatial outside a scene
does not paint anything.

`SpatialGroup` changes the parent pose context without emitting an SVG group.
It preserves the individual identity and sortability of descendant leaves.
Do not wrap independently sorted Spatial components inside another leaf's
`children`: those children are the emitted flat graphic, not a spatial subtree.

### Spatial, SpatialGroup, SpatialPath and Body

`Spatial` owns the positioning/registration of a flat graphic. `SpatialGroup`
owns parent-child spatial relationships: descendants inherit the accumulated
pose and keep separate drawing identities. A plain SVG `<g>` instead groups
graphical geometry in painter order. These are different responsibilities.

`Body`/`Head` are private graphical components in `Dragon.jsx`. They currently
take `position` and `rotation` props and wrap their SVG paths in G3 (hence Spatial).
No implemented `SpatialPath` export, class, component, or sampler exists. The
name represents the established requirement for a generic spatial path concern,
not a hidden implementation in `lineCoords`, the SVG `d` string, or a Body.
Its API, coordinate frame, sample representation, and relationship to timing
need an explicit decision before implementation.

Positioning must not depend on individual Body artwork or positioning lines.
A future path/sampler may supply mathematical poses through a narrow contract;
graphics consumes poses without owning path traversal. Debugging a path by
drawing an SVG line must not make that line the owner of Body positions.

## World coordinates, poses, and camera

The implemented pose shape is `{ position: { x, y, z }, rotation, scale }`.
The long design document sometimes uses `angle`; current code uses `rotation`.
`combinePose` rotates the child's XY by the parent's angle, scales those XY
offsets, and adds the parent position. It adds Z independently, sums rotations
(degrees), and multiplies scales. Depth is continuous, not a numbered layer.

Camera depth is `point.z - camera.position.z`. Depth <= `near` is culled;
otherwise projection scale is `focalLength / depth` and XY are camera-relative
coordinates multiplied by that scale. App uses focal length 10, camera position
zero, and the Camera default near plane 0.01. Scene sorts descending projected
depth, so later/nearer SVG pieces paint over farther pieces. Emitted transforms
are `translate(...) scale(...) rotate(...)`; changing their order changes behavior.

World positions must not change when the camera moves. Mutating the Camera
instance does not itself trigger a React render; updates currently depend on
an enclosing render. `G3` delegates to Spatial with default z=1. An explicitly
passed z=0 is now on the near plane, unlike the archived G3 zero-depth fallback.
The live Dragon debug graphic is one G3/Spatial at z=1, not a chain of separate
depth-sorted body pieces.

The actual parent-child transformation, with parent angle theta in radians, is:

```text
worldX = parentX + parentScale * (childX*cos(theta) - childY*sin(theta))
worldY = parentY + parentScale * (childX*sin(theta) + childY*cos(theta))
worldZ = parentZ + childZ
worldRotation = parentRotation + childRotation       (degrees)
worldScale = parentScale * childScale
```

Z is not scaled/rotated by the XY transform. Camera-relative coordinates and
projection are exactly:

```text
relativeX = worldX - camera.position.x
relativeY = worldY - camera.position.y
depth = worldZ - camera.position.z
if depth <= camera.near: omit the piece
perspectiveScale = camera.focalLength / depth
screenX = relativeX * perspectiveScale
screenY = relativeY * perspectiveScale
graphicScale = perspectiveScale * worldScale
```

`new Camera({ position, focalLength, near })`, `depth(point)` and `project(point)`
are the entire current Camera API. Orientation is implicitly fixed to the
existing axes: there is no camera rotation, view matrix, yaw, pitch or roll.
Object `rotation` is 2D graphic rotation and must not be described as camera
orientation. No camera-orientation convention is decided by this document.
Global depth sorting is `b.projected.depth - a.projected.depth`; equal-depth
pieces keep their current collection order through the stable sort. No explicit
equal-depth priority API is implemented.

## Dragon formulas and state

`createInitialDragonState()` allocates a fresh state per instance. The current
initial polyline has one `[x, y, length]` point, angle `a=0`, accumulator `b=0`,
index `n=0`, target `(100,100)` with target heading 90 degrees, spacing 1,
and `amtBodies=40`. Short variable names belong to the experimental formulas;
preserve their meaning when changing code.

Each animation callback calls `calcTrajectory()` then `appendPosition()`.
Heading is signed `atan2(deltaY, deltaX)` converted to degrees. Correction
uses the difference between target/current heading offsets and a power of
distance; appendPosition updates angular accumulation and the XY endpoint.
At capacity it shifts the point array and appends/shifts the displayed path.
`renderDragonDebug` draws axes, the path, target/current headings and their
connecting line. Console diagnostics are named, padded, and rounded to 3 decimals.

`useObjectProxyState` exposes nested proxies with `.value` and `.set(valueOrFn)`.
The setter uses React functional updates and copies containers along a path.
It does not provide synchronous mutation of an already captured proxy snapshot.
The Dragon currently mutates its coordinate array before setting state. Do not
assume all existing data handling is immutable or that the next function in one
frame sees an earlier `.set()` immediately.

The animation hook reports seconds using performance.now and requestAnimationFrame,
then cancels on cleanup. With no dependency argument its effect is rescheduled on
each render. `useTimeoutLoop` tracks the latest callback in a ref and cancels its
timeout; absent delay disables it. `useMousePosition` listens only to mousemove;
it is not a touch, pencil, gaze or pointer implementation.

### Line coordinates, body poses and graphical geometry

`lineCoords` is numerical `[x, y, length]` data in the trajectory's local plane.
`coordsToPath`, `appendLastPoint` and `shiftPolylinePath` create a debug SVG `d`
string from XY values; that string has no spatial-depth or Body ownership API.
The current endpoint calculation, before any array shift, uses:

```text
n = lineCoords.length - 1
nextX = lineCoords[n][0] + cos(degToRad(a)) * spacing
nextY = lineCoords[n][1] + sin(degToRad(a)) * spacing
flen = n == 0 ? 0 : lineCoords[n - 1][2]
nextLength = flen + sqrt(nextX*nextX + nextY*nextY)
```

This is the implemented formula, not a verified arc-length definition: it uses
absolute endpoint distance and an earlier point's length. Do not document it as
uniform-distance body sampling. Heading uses signed `atan2`; trigonometric
functions take radians while the live angle state is degrees.

`bodyCoords` is not in current initial state and there is no active conversion
from line samples to body poses. Inactive `Bodies` reads `{ x, y, r }` for body
pieces but indexes the first entry as `[0]`/`[1]` for the Head. Archived conversion
experiments use both arrays and objects; they do not establish a consistent API.
Document/resolve that mismatch before activating segmented body rendering.
The SVG path coordinates inside Body/Head are shape-local artwork, not the
trajectory polyline. Shape geometry should flow through a spatial pose and
Camera projection rather than become part of the navigation formula.

## Compound APIs and intended boundaries

`compose(Base)().part(name, Part).body(define).view(View).build()` returns a
subclass. Construction invokes the Base, creates parts with the compound as
owner (or uses a supplied non-function part value), and assigns body definitions.
Instances expose `getPart(name)` and `render(props)`. The builder does not
automatically subscribe React to part mutations or turn the class into a component.

The use of a Base class describes the current builder implementation, not a
required design principle for future architecture. Prioritize composition
through Parts and orchestration through the enclosing Compound Class. Preserve
the current builder unless a specific feature requires changing it; this
clarification does not call for removing Base or refactoring the implementation.

Parts encapsulate behavior and context for one concern; the enclosing Compound
Class composes capabilities in `.body(...)`. For new substantive features,
first identify the concern boundary, add a Part when it owns meaningful behavior
or context, and connect its capabilities with small inline functions. A graphics
Part may need `() => Pose`, not the whole math/navigation Part. Keep formula
Parts free of React/SVG projection and give the view already-computed state.
Do not split every small helper into a Part or retrofit the whole Dragon in
an unrelated task.

The builder passes the compound owner to each constructed Part. This permits
cross-Part access technically, but does not require or enforce it; avoid using
that access to couple unrelated concerns. Non-function Part values are reused
as supplied, so they are not automatically independent per-instance state.

`compoundFunction(beta)(alpha)` returns `beta(alpha)`. The design contract is:
alpha is supplied inline, beta captures its concern and returns gamma, gamma
calls alpha through that closure. The primitive does not enforce this contract.
`recipe().through(part, step).build(finalAlpha)` constructs closures from right
to left; transform execution follows declaration order. `part` is the actual
value passed to step, not a lookup key. Do not mistake the proposed class-level
`.recipe(...).end()` syntax in the design document for an implemented API.

Future work should keep math independent from SVG and camera projection;
graphics consumes world state, Camera projects it, Scene orders it. Parts and
continuations should expose the smallest contract needed by another concern.
The proposed CurvePart, NavigationPart, DepthPart, Cave and a fully composed
Dragon do not exist in the active implementation.

### Canonical Part-owned Compound Function

The established definition is specifically alpha -> beta -> gamma: alpha is
defined inline at the beta call site; beta belongs to a Part and captures its
context; gamma is defined inside beta, invokes alpha, and is the reusable recipe.
It provides need-to-know composition, not an interchangeable generic callback,
event bus, dependency-injection system or conventional inheritance hierarchy.
The primitive alone accepts any beta; enforcing Part ownership is a design rule.
Its generic implementation does not authorize replacing Part-owned Compound
Functions with ordinary callbacks. Preserve the distinction between the helper's
accepted inputs and the stricter architectural contract.

This minimal TypeScript illustration uses the same closure construction as
`compoundFunction(beta)(alpha)`. It proposes no new builder API. `DepthPart`
and these types are illustrative, not existing files or a TypeScript migration:

```ts
type Point2 = { x: number; y: number };
type Point3 = Point2 & { z: number };

class DepthPart {
  constructor(private readonly z: number) {}

  apply(alpha: (t: number) => Point2): (t: number) => Point3 { // beta
    const z = this.z; // capture this Part's context
    return (t: number): Point3 => ({ ...alpha(t), z }); // gamma invokes alpha
  }
}

const depth = new DepthPart(1.5);
const spatialPosition = depth.apply(t => ({ x: t * 10, y: 0 })); // inline alpha
const point = spatialPosition(2); // reusable gamma -> { x: 20, y: 0, z: 1.5 }
```

Where the exported helper is used with a Part method, preserve its receiver:
`compoundFunction(alpha => depth.apply(alpha))(t => ({ x: t * 10, y: 0 }))`.
Do not pass an unbound instance method that loses `this`. `recipe().through`
is only the implemented shorthand for nested transform closures; it does not
replace the Part-owned beta construction or imply that ordinary pipelines
exhaust the Compound Function design.

## Architectural discrepancies and open decisions

- Live Dragon combines math, navigation sketches and SVG in one module, rather
  than independent Compound Parts. The primitives exist; feature integration
  remains incomplete. This documentation records the gap without changing it.
- The helper/builder cannot enforce concern independence, inline-alpha usage,
  Part-owned beta, or gamma invoking alpha. Tests cover examples of those
  contracts; code review must check substantial implementations.
- Inactive `Bodies` wraps Body/Head (which themselves use Spatial via G3) in
  another G3/Spatial. That contradicts independently sortable leaf semantics;
  the outer graphic also contains a plain SVG `<g>` that does not supply a
  spatial pose context. Reconcile it with SpatialGroup before activation.
- SpatialPath, a stable body-pose schema, a validated line-to-body sampler,
  per-body continuous depth, and camera orientation are absent. Their exact
  APIs/conventions remain unresolved; do not invent historical decisions.
- The design document's suggested Parts and class-level recipe DSL are future
  examples. Existing JavaScript APIs and these explicit requirements determine
  what is currently supported. Proposed changes need an explicit decision,
  not a rewritten design document that rationalizes contradictory code.

## Known limitations to preserve as explicit follow-up work

- Navmesh helpers in Dragon are inactive sketches. They refer to state fields
  absent from initial state, `triangle` versus `triangles`, and undefined values
  such as `centerX`, `centerY`, and `angleIndexes`. Do not activate them as-is.
- `Bodies`, `Body`, and `Head` artwork is retained but the Bodies render call is
  commented out. Full segmented dragon movement is not currently demonstrated.
- The trajectory and proxy update behavior is experimental. A successful build
  or pure-module test does not establish correct motion, length accumulation,
  or browser animation behavior. The displayed path is updated after capacity
  is reached, so it does not trace every initial growth frame.
- `closestAngle3` accepts radians and its wrap handling assumes angles in a
  suitable single-turn range. Other live Dragon headings/rotations use degrees.
- Archived sources include invalid syntax, stale imports, old hook usage and
  earlier formulas. Keep comments/history without treating them as live modules.
- The old DOM stage test is retained without a configured DOM runner. The
  headless suite does not claim React registration, layout, animation or Safari
  coverage. HTTP smoke checks transform/serve code but do not execute it in a browser.
- `public/manifest.json` still has CRA sample branding. There is no service
  worker/offline cache or native build/signing/deployment configuration.

## Reproducible tooling and handoff

`package-lock.json` v3 pins the dependency tree with integrity hashes and has
no local filesystem dependencies. Use `npm ci` with dev dependencies. Vite and
its React plugin provide the build/JSX pipeline. Node tooling uses `.mjs`; do
not add `type: module` solely to make tests import `.js`, as that changes package
semantics. Tests use the existing Vite SSR module loader without mounting the app.
The sole Vite config is `vite.config.mjs` (the identical `.js` copy was removed).

The live bundle uses React/ReactDOM. `react-svg-path` appears in historical
experiments; `web-vitals` is only called by the archived entry. Testing Library
packages belong to the retained old test. No dependencies were added for the
headless tests. There is no independent type-check or lint command.

See [AGENTS.md](../AGENTS.md) for install/check commands, safe Git handoff,
and Cloud/device boundaries. Configure the Cloud checkout to access the private
GitHub repository, use the agreed shared revision/branch, and install with
`npm ci` while registry access is available. Run `npm run check` after setup or
changes. Keep network failures distinct from code failures. Git commits and
GitHub pushes are separate steps; this preparation commit needs push approval.

Official references for environment and instruction configuration:
[Cloud environments](https://developers.openai.com/codex/cloud/environments) and
[AGENTS.md](https://developers.openai.com/codex/guides/agents-md).

## Preparation verification (2026-10-19)

The starting checkout was clean on `main`; fetching origin succeeded and
HEAD matched `origin/main`. Exact installation with `npm ci --no-audit --no-fund`
succeeded without changing the lockfile or adding dependencies.

Validation was performed on macOS with Node 22.14.0/npm 10.9.2. The repository's
existing Node 20 selection remains in `.nvmrc`; that version was not exercised
in this session. `npm run check` passes: production build, twelve core tests,
and development/production HTTP smoke checks. Git whitespace checks pass.
The original iCloud checkout stalled during Vite startup; the same files
installed and passed in a clean temporary copy outside iCloud. A Git check
also stalled, then passed with `git -c core.fsmonitor=false diff --check`.
Do not infer a Node incompatibility from those filesystem/tooling stalls.
For ongoing Mac development, prefer a normal local Git checkout outside a
file-sync folder if this recurs; GitHub remains the handoff mechanism.

No Docker executable/Linux sandbox was available here, so this is not a
claim of a completed Linux Cloud run. No browser DOM, physical iPad/Safari,
MiniLibX C build or native Apple build was validated. Lint/type-check commands
are absent. Browserslist reports old browser data during smoke checks; it is
a warning, and the dependency tree was intentionally left locked.

Remaining setup: approve/push this preparation commit, grant Codex access to
the private repository if needed, select the agreed branch/revision in Cloud,
provision Node/npm (prefer the same version on Mac and Cloud), run `npm ci`
with registry access, and run `npm run check` in the Linux environment. Cloud
setup/credentials and optional preview forwarding are environment configuration,
not features enabled by committing these files.
