# Symbolics Development Guide

## Purpose and current state

Symbolics v3 is an experimental 2.5D world made from flat SVG graphics.
The running app is a dragon trajectory/debug study: an animated polyline,
axes, target/current heading indicators, and labeled console diagnostics.
The iPad version is this React web application running in Safari on iPadOS.
Linux refers only to Codex Cloud's development/validation environment, not the
application's target platform. There is no native iPad app, backend,
persistence service, or Xcode project.

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the implementation map
and known limitations. `SYMBOLICS_V3_ARCHITECTURE.md` preserves the broader
design intent; its TypeScript examples and proposed Parts are not all implemented.
Treat source/configuration as evidence of current functionality.

## Architectural safeguards

- Before substantial changes, read [the architecture](docs/ARCHITECTURE.md) and
  [decision records](docs/decisions/README.md). Distinguish implemented behavior,
  established requirements not yet implemented, and unresolved questions.
- Preserve the established invariants and reuse existing Compound/spatial
  abstractions. Identify conflicts before changing architectural foundations;
  report discrepancies instead of silently changing code or inventing an API.
- New concerns belong in independent Parts. Compose their capabilities through
  narrow contracts; Parts must not depend on unrelated Parts. Keep math and
  graphics separate. Compound Functions mean inline alpha at a Part's beta
  method call, beta's Part closure returning gamma, and gamma invoking alpha.
  Do not replace this mechanism with generic callbacks, event buses, dependency
  injection, or conventional inheritance.
- Keep positioning generic: Spatial/SpatialGroup describe poses/relationships;
  graphical Bodies consume them. Do not couple Bodies to positioning lines.
  SpatialPath is a design requirement with no current implementation/API;
  camera orientation is also not implemented. Resolve those contracts explicitly.
- Review substantial implementations for architectural compliance and relevant
  regression coverage. Never rewrite architecture documentation merely to
  justify a conflicting implementation. Document agreed changes as decisions.

## Architecture and invariants

- `index.html` loads `src/main.jsx`, which mounts `App` with React StrictMode.
- `App` assembles `Stage -> Composition -> Layer -> Dragon`.
- `Stage` provides the centered, clipped 1280x720 SVG viewport. `Composition`
  supplies time/delta and the spatial scene; `Layer` gates children by time.
- `Dragon.jsx` retains the experimental correction/endpoint formulas and
  inactive navigation/body graphics code. `src/dragon/` contains initial state,
  numerical/path helpers, and debug drawing. Do not silently change formulas.
- `src/components/spatial/`: `Spatial` registers one flat graphic at one depth;
  `SpatialGroup` combines local/world poses; `Camera` projects positions;
  `SpatialScene` collects, culls, sorts far-to-near, and emits SVG groups.
- World depth is continuous. `Layer` means composition timing, never depth.
  World positions remain independent of camera position. Perspective belongs
  to `Camera`; global painter ordering belongs to `SpatialScene`.
- `SpatialGroup` is a coordinate context, not an SVG group or a single sorted
  piece. Independently sortable graphics must be separate `Spatial` leaves.
  Avoid nesting Spatial leaves inside the graphic of another Spatial.
- `G3` is a compatibility adapter to `Spatial`, not the old projection formula.
- `src/compound/compound.jsx` implements the Compound Class builder and
  Compound Function primitive. A Part's beta receives an inline alpha and returns gamma;
  gamma calls alpha through the concern's closure. Keep these narrow contracts.
  These APIs are available but the live Dragon has not been rebuilt with them.
- Keep mathematical state, graphics, projection, and drawing order separate.
  Keep existing comments, experimental notes, archived source, and SVG artwork.

## Stack and conventions

The app uses JavaScript ES modules, JSX, CSS, HTML, and SVG; React/ReactDOM 18
and Vite 5 with `@vitejs/plugin-react`. There is no TypeScript compiler/config.
`react-svg-path`, `web-vitals`, and Testing Library packages remain declared
dependencies, but are not used in the live entry graph. `src/archive/` contains
older experiments, including invalid or outdated source. Do not import it
into the app or apply live-source validation indiscriminately to the archive.
`c/` contains separate MiniLibX C experiments and design notes, not an npm target.

Follow the surrounding style: function components/hooks, named exports for
components/helpers, two-space indentation, double quotes, camelCase functions
and variables, PascalCase components/classes, and JSX in `.jsx` files.
Semicolons/spacing are inconsistent in historical files; avoid unrelated churn.
Use `.mjs` for Node tooling and the Vite config. Preserve signed angle deltas:
`radToDeg(Math.atan2(latterY - formerY, latterX - formerX))`. Dragon headings
and rotations are degrees; trig uses radians; `closestAngle3` uses radians.
Animation hook time/delta values are seconds. Diagnostic values use three
decimal places with padded named columns. Preserve hook cleanup and StrictMode
compatibility. Never assume a proxy `.set()` immediately updates a captured
`.value` snapshot; React batches state changes.

## Mac and Cloud workflow

Mac and Codex Cloud are two environments for this same GitHub repository:
`https://github.com/rctdeclan/symbolics-ipad`. GitHub is the synchronization point;
local filesystem/iCloud changes and unpushed commits do not transfer to Cloud.
Prefer the single existing shared development branch, currently `main`, and
work sequentially across devices. Inspect the actual branch in every session.
Do not create a branch per device. If a Cloud task supplies an isolated branch,
report its name and reconcile it with the shared branch explicitly.

Before new work:

```sh
git status --short --branch
git remote -v
git fetch origin
git log --oneline --left-right HEAD...origin/main
```

Fetch only when network access is available. On a clean shared `main`, when
behind and not diverged, use `git merge --ff-only origin/main`. Preserve all
existing uncommitted changes; do not auto-stash, switch branches over changes,
or overwrite files. Inspect and report dirty state before integrating remote work.
If a different shared branch is agreed, substitute it for `main` in these commands.

Do not create merge commits unnecessarily. Never force-push, hard-reset, discard
work, or rewrite shared history without explicit permission. If histories diverge,
report ahead/behind commits and propose safe reconciliation; do not choose a
destructive reset or rebase automatically. Preserve both sides until agreed.
Commit completed work in small meaningful commits, staging only intended files.
Run checks before handoff and report commit hash, branch, and remaining dirty state.
Push only when authorized. A successful commit is not a successful push; verify
the push result. If fetch/push is blocked by network, permissions, or credentials,
report that synchronization did not succeed. Do not claim a cached remote ref is
current after a failed fetch. This preparation task must remain unpushed until
the user approves its push.

## Install, run, and validate

Run commands from the repository root. `.nvmrc` selects Node 20; `package.json`
declares Node >=18. Use npm with the committed lockfile (lockfileVersion 3).
Use the same Node/npm versions across Mac and Cloud where possible. Do not
replace the lockfile or upgrade packages just to prepare Cloud.

| Task | Command | Notes |
| --- | --- | --- |
| Install exact dependency tree | `npm ci` | Requires npm registry access and dev dependencies. |
| Development | `npm run dev` | Vite, normally port 5173; does not need desktop auto-open. |
| Development alias | `npm start` | Same Vite command. |
| Production build | `npm run build` | Writes ignored `dist/`; no GUI required. |
| Preview build | `npm run preview` | Requires `dist/`; normally port 4173. |
| Core tests | `npm test` | Node test runner + existing Vite module loader; no DOM. |
| HTTP smoke checks | `npm run smoke` | Requires build; starts/stops loopback dev/preview servers. |
| Full available validation | `npm run check` | Build, core tests, HTTP smoke checks; exits on failure. |
| Patch hygiene | `git diff --check` | Does not replace application checks. |
| Type-check | Not configured | No TypeScript or type-check script; Vite transpilation is not type checking. |
| Lint | Not configured | No ESLint configuration or lint script. Do not invent a passing lint command. |

The legacy `src/App.test.js`/`src/setupTests.js` require a browser-like DOM and
Jest-style globals; they are retained but not run by `npm test`. No DOM/browser
test runner is configured. Current core coverage is in `tests/core.test.mjs`.

For headless Linux, provision Node/npm, run `npm ci`, then `npm run check` and
`git diff --check`. The checks use portable Node APIs and loopback HTTP; no
macOS frameworks, Xcode, display server, application secrets, or external API
are required. Configure dependency installation while registry access is allowed.
If local server binding is prohibited, report the HTTP smoke check as blocked;
still run the build and core tests. Do not present HTTP checks as visual or
React runtime validation. Browser changes also need an actual browser run.
For an externally supplied Cloud preview, use `npm run dev -- --host 0.0.0.0`
only within the environment's intended preview mechanism; localhost on an iPhone
is not the Cloud container. Do not assume preview forwarding is configured.

## Platform boundaries

- Target runtime: Safari on iPadOS. Development/validation hosts: the Mac and
  Codex Cloud. Supporting Linux-based tooling does not change that browser target.
- The web app can build on Linux or macOS. iPadOS/Safari layout, touch/pointer
  behavior, animation smoothness, and standalone-mode behavior need device or
  Safari testing. The stage is fixed size; the mouse hook only handles mousemove.
- The manifest contains legacy CRA branding and no service worker is registered;
  do not claim native installation, offline support, or a complete PWA.
- No Swift, Objective-C, React Native, Capacitor, entitlements, signing, native
  packaging, or Xcode build command exists. Any future native Apple build/signing
  would need macOS/Xcode and device-specific verification outside Linux Cloud.
- C sketches depend on MiniLibX and a window/display. Historical comments mention
  AppKit/OpenGL/X11; dependencies/build targets are not provisioned here and the
  sketches are incomplete. Do not include them in web validation or claim they build.
- `.vectornator` artwork needs a compatible graphics editor for visual editing;
  SVG exports and browser code can be worked on independently in Cloud.
