# Architectural Decision Records

These records preserve the established Symbolics v3 principles for
`symbolics-ipad`. Recorded during migration preparation on 2026-10-19; this
is not a claim about when the original discussions took place. Evidence is the
source implementation, `SYMBOLICS_V3_ARCHITECTURE.md`, and the requirements
explicitly restated by the project owner. Documentation examples are not proof
that a feature exists. See [the implementation map](../ARCHITECTURE.md).

| Decision | Status |
| --- | --- |
| [0001: Independent Parts in Compound Classes](0001-compound-classes.md) | Established; builder implemented, live Dragon adoption incomplete |
| [0002: Part-owned alpha -> beta -> gamma recipes](0002-compound-functions.md) | Established; primitives implemented, feature adoption incomplete |
| [0003: Generic spatial positioning and relationships](0003-spatial-relationships.md) | Established; Spatial/SpatialGroup implemented, SpatialPath absent |
| [0004: Mathematics, geometry, camera and rendering boundaries](0004-math-graphics-rendering.md) | Established; renderer implemented, game/graphics separation incomplete |

For future changes, state the requirement, source evidence, consequences,
implementation status and remaining questions. Record an agreed superseding
decision explicitly; never edit these records merely to make conflicting code
appear compliant. No new implementation API is approved by an open question.
