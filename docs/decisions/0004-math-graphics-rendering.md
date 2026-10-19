# 0004: Separate Mathematics, Graphical Geometry, Camera and Rendering

Status: established design; projection/renderer implemented; game integration partial.

## Decision

Mathematics determines world state/poses. Graphics describes flat shape geometry
at those poses. Camera transforms world positions into camera-relative projected
coordinates. Scene owns depth ordering and SVG emission. Temporal Layer is not
spatial depth. Keep formulas independent from SVG projection and keep navigation
out of graphical Bodies. Reuse these boundaries for new features.

## Source evidence and actual formulas

`Camera({ position, focalLength, near })` implements `depth(point)` and
`project(point)`. Relative XY subtract camera XY; depth subtracts camera Z.
Cull when depth <= near; otherwise `scale = focalLength / depth` and projected
XY equal relative XY multiplied by that scale. Object/world positions are not
mutated by projection. Camera orientation is fixed implicitly to the axes;
there is no camera rotation/view-matrix API. Object rotation is in-plane degrees.

`SpatialScene` sorts by descending camera-relative depth and emits
`translate(x,y) scale(perspectiveScale * pose.scale) rotate(pose.rotation)`
SVG groups. `Stage` centers the viewport and clips it. Plain SVG paths are
local graphic geometry, not world paths or navigation objects.

## Line coordinates and Body coordinates

Dragon's `lineCoords` holds `[x,y,length]` samples; its helpers serialize XY
into a debug SVG path. No active conversion to Body coordinates exists.
The inactive renderer reads object `{x,y,r}` samples for Body but array-style
XY for Head. The implemented length formula is not validated arc length;
uniform-distance sampling and a consistent body-pose schema remain open.
See [architecture](../ARCHITECTURE.md) for the exact current endpoint/length
formulas and discrepancies. Do not infer an existing SpatialPath API from them.

## Consequences and gaps

The current Dragon module still mixes formula logic, dormant navigation code
and graphical components. Record that implementation debt; do not change
architecture records to bless it as the intended separation. Per-body depth,
validated path sampling and camera orientation need explicit decisions before
implementation. Camera projection and pose math have core regression tests;
actual browser painting, dynamic registration and Safari behavior do not yet
have automated coverage. A build or HTTP check is not proof of those behaviors.
