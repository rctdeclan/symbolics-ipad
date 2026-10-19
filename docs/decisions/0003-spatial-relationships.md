# 0003: Generic Spatial Positioning and Group Relationships

Status: established design; Spatial/SpatialGroup implemented; SpatialPath absent.

## Decision

Spatial positioning must be generic, independent of the artwork of a Body or
any positioning line. `Spatial` positions one indivisible flat graphic at a
continuous world depth. `SpatialGroup` describes relationships/local coordinate
systems while retaining independent descendant leaves. A group is not one
flat SVG graphic or one depth-sorted render piece. Mathematical positioning
and graphical representation remain separate concerns.

## Source evidence

`src/components/spatial/Spatial.jsx` combines its local pose with the context,
registers the graphic in a layout effect and unregisters on cleanup.
`SpatialGroup.jsx` combines a parent/local pose and provides it to descendants;
it emits no SVG group. `position.js` defines the actual pose/transform formulas:
rotate and scale child XY before translating, add Z independently, sum rotations
in degrees, multiply scales. The scene root pose is at `(0,0,0)`.

`SpatialScene` globally orders registered leaves irrespective of semantic
parentage. `G3` adapts older call sites to Spatial. `Body` and `Head` in Dragon
draw path geometry inside G3; the currently active debug view is a single leaf.

## SpatialPath and implementation discrepancy

There is no `SpatialPath` implementation or API in this repository. The name
expresses the requirement for a generic spatial path abstraction, not an alias
for Dragon's numerical line samples or the debug SVG `d` string. Its coordinate
frame, sampling/timing contract and ownership are open. A future Body should
consume a pose from a narrow mathematical contract rather than own traversal
or attach its positioning to a graphical line.

The inactive `Bodies` implementation nests Body/Head Spatial leaves inside an
outer G3/Spatial, contrary to independent leaf semantics. Its SVG group does
not substitute for a SpatialGroup. Report and reconcile this before activation;
this documentation-only extension does not silently change the application.

Protection: tests verify composed parent-child transforms, nesting and depth
independence from XY scale. React registration and global painter-order behavior
still need browser/DOM coverage; pure tests do not claim that coverage.
