# Symbolics v3 Architecture

## Purpose

Symbolics is a 2.5D game world built from ordinary flat SVG graphics.

The world is not a conventional 3D scene. Game mathematics determines
positions in a 2D level and adds a continuous depth coordinate. Graphics
remain flat SVG components. A formal camera projects those positioned
graphics into screen space, and the scene orders them by camera-relative
depth.

This gives Symbolics a deliberately small spatial model:

``` text
2D game mathematics
        +
continuous depth
        ↓
2.5D world position
        ↓
flat SVG graphics
        ↓
camera projection
        ↓
depth ordering
        ↓
SVG
```

A central example is the snake dragon. The dragon is one game object,
but its many `Body` components may occupy different depths
simultaneously. Every `Body` remains one indivisible flat graphic at one
depth. The renderer can therefore draw cave pieces between individual
dragon body pieces.

------------------------------------------------------------------------

# 1. Core architectural rule

Keep these concerns separate:

> **Math determines where an object exists.\
> Spatial describes which flat graphic exists at that position.\
> Camera determines how that world position is seen.\
> Scene determines when that graphic is drawn.**

This separation is especially important while the curve-correction,
curve-endpoint, and triangle-navigation formulas are still being
developed.

The formulas should not contain SVG projection code. SVG components
should not need to understand the navigation formulas.

------------------------------------------------------------------------

# 2. The complete pipeline

The overall Symbolics pipeline is:

``` text
                    MATH
                     │
          triangle navigation
                     │
                     ▼
             curve correction
                     │
                     ▼
              curve endpoint
                     │
                     ▼
                  {x,y}
                     │
                     │ Compound Function
                     ▼
                  depth
                     │
                     ▼
                {x,y,z}
                     │
                     ▼
             body positioning
                     │
═════════════════════╪═════════════════════
                     │
                 GRAPHICS
                     │
                     ▼
                <Spatial>
                     │
                     │
             <SpatialGroup>
          relative positioning
                     │
                     ▼
             SpatialPiece[]
                     │
═════════════════════╪═════════════════════
                     │
                  CAMERA
                     │
                     ▼
          world → camera relative
                     │
                     ▼
               perspective
                     │
                     ▼
             RenderPiece[]
                     │
═════════════════════╪═════════════════════
                     │
                   SCENE
                     │
                sort depth
                     │
                     ▼
                    SVG
```

There are therefore two broad pipelines:

``` text
GAME / MATH
determines world state and position

        ↓

SPATIAL / GRAPHICS
turns that state into visible SVG
```

Compound Classes organize the concerns that participate in those
pipelines.

Compound Functions provide narrow connections between concerns.

------------------------------------------------------------------------

# 3. World position

A formal Symbolics position is:

``` ts
type Position = {
  x: number
  y: number
  z: number
}
```

`x` and `y` describe position in the level.

`z` describes continuous depth in the 2.5D world.

For example:

``` ts
const position = {
  x: 120,
  y: 80,
  z: 1.5
}
```

`z` is not a layer number and is not restricted to integers.

Valid depths include:

``` text
1
1.1
1.5
1.527
2
8.23
```

The important distinction is:

``` text
Position.z
    continuous spatial depth

Layer
    composition / timing organization
```

The existing Symbolics `Layer` concept should therefore remain concerned
with things such as `begin`, `end`, `continuous`, `time`, and `delta`.
It should not become the depth system.

------------------------------------------------------------------------

# 4. Pose

When rotation is needed, position can be wrapped in a pose:

``` ts
type Pose = {
  position: Position
  angle: number
}
```

Symbolics can initially keep rotation two-dimensional.

A Body may therefore have:

``` ts
const pose = {
  position: {
    x: 120,
    y: 80,
    z: 1.5
  },
  angle: 24
}
```

The `z` coordinate does not need to rotate with the 2D angle.

------------------------------------------------------------------------

# 5. Spatial

`Spatial` represents one indivisible flat graphic at one position in the
Symbolics world.

Conceptually:

``` tsx
<Spatial
  position={{ x: 20, y: 10, z: 1.5 }}
  rotation={20}
>
  <BodyGraphic />
</Spatial>
```

means:

> This complete SVG graphic exists at `{20, 10, 1.5}` and can be
> independently projected and depth-sorted.

A `Spatial` produces one spatial piece.

Conceptually:

``` ts
type SpatialPiece = {
  position: Position
  rotation: number
  element: React.ReactNode
}
```

For example:

``` ts
{
  position: {
    x: 20,
    y: 10,
    z: 1.5
  },

  rotation: 20,

  element: <BodyGraphic />
}
```

## Important constraint

All graphics inside one `Spatial` occupy one depth.

The graphic itself is still ordinary SVG.

For example:

``` tsx
function BodyGraphic() {
  return (
    <g>
      <ellipse rx={20} ry={10} />
      <circle cx={12} cy={0} r={3} />
    </g>
  )
}
```

The ellipse and circle are not separately depth sorted. Together they
make one flat Body graphic.

If two things must be independently ordered in depth, they should be
separate `Spatial` pieces.

------------------------------------------------------------------------

# 6. SpatialGroup

`SpatialGroup` is a generic spatial coordinate system.

It accepts spatial children and repositions them relative to the group.

For example:

``` tsx
<SpatialGroup
  position={{ x: 100, y: 50, z: 2 }}
>
  <Body position={{ x: 0,  y: 0, z: 0 }} />
  <Body position={{ x: 10, y: 2, z: 0.1 }} />
  <Body position={{ x: 20, y: 5, z: 0.3 }} />
</SpatialGroup>
```

The child positions are local to the group.

Their resulting world positions are:

``` text
GROUP             CHILD              WORLD

{100,50,2}   +   {0,0,0}       →   {100,50,2}
{100,50,2}   +   {10,2,.1}     →   {110,52,2.1}
{100,50,2}   +   {20,5,.3}     →   {120,55,2.3}
```

## SpatialGroup is not SVG `<g>`

This distinction is fundamental.

An SVG group:

``` tsx
<g>
  <Body />
  <Body />
</g>
```

creates one subtree at one location in SVG painter order.

A Symbolics spatial group:

``` tsx
<SpatialGroup>
  <Body />
  <Body />
</SpatialGroup>
```

means:

> Interpret these children as independently positioned spatial pieces
> sharing a coordinate system.

The `SpatialGroup` itself does not need to become a visible SVG element.

Its descendants are eventually flattened into independent spatial
pieces.

------------------------------------------------------------------------

# 7. Nested SpatialGroups

Spatial groups can be nested.

``` tsx
<SpatialGroup position={levelPosition}>

  <SpatialGroup position={dragonPosition}>

    <Body position={bodyPosition} />

  </SpatialGroup>

</SpatialGroup>
```

The positions accumulate:

``` text
level position
      +
dragon position
      +
body position
      =
world position
```

For example:

``` text
Level
{100, 50, 1}

        +

Dragon
{20, 10, .5}

        +

Body
{5, 2, .2}

        ↓

World
{125, 62, 1.7}
```

This creates a simple spatial hierarchy without requiring a conventional
3D scene graph.

------------------------------------------------------------------------

# 8. The dragon

The dragon is a good example of why `SpatialGroup` exists.

The dragon is semantically one game object:

``` text
Dragon
```

but graphically consists of many independently positioned pieces:

``` text
Dragon
 ├── Head
 ├── Body
 ├── Body
 ├── Body
 ├── Body
 └── Tail
```

Each Body is a singular flat graphic at a singular depth.

Conceptually:

``` tsx
<SpatialGroup position={dragonPosition}>
  <Head position={headPose.position} />

  <Body position={body1.pose.position} />
  <Body position={body2.pose.position} />
  <Body position={body3.pose.position} />

  <Tail position={tailPose.position} />
</SpatialGroup>
```

The important property is that `SpatialGroup` does not collapse these
into one render piece.

After spatial interpretation they remain:

``` text
Head       z=1.2
Body       z=1.4
Body       z=1.8
Body       z=2.3
Tail       z=2.7
```

They can therefore be interleaved with cave graphics.

------------------------------------------------------------------------

# 9. The cave

The cave uses the same spatial system.

A cave may be built from flat SVG walls at different depths:

``` tsx
<SpatialGroup position={cavePosition}>

  <CaveWall position={{ x: 0, y: 0, z: 1 }} />
  <CaveWall position={{ x: 0, y: 0, z: 2 }} />
  <CaveWall position={{ x: 0, y: 0, z: 3 }} />

</SpatialGroup>
```

Each `CaveWall` can be an SVG rectangle or another flat SVG shape
containing a hole.

The cave does not need special depth behavior. Its walls and the
dragon's bodies eventually become members of the same collection of
spatial pieces.

------------------------------------------------------------------------

# 10. Flattening the spatial hierarchy

Before final rendering, the semantic React hierarchy is flattened.

For example:

``` text
World SpatialGroup
│
├── Cave SpatialGroup
│   ├── CaveWall
│   ├── CaveWall
│   └── CaveWall
│
└── Dragon SpatialGroup
    ├── Head
    ├── Body
    ├── Body
    └── Tail
```

becomes conceptually:

``` text
SpatialPiece(CaveWall)   z=1
SpatialPiece(CaveWall)   z=2
SpatialPiece(CaveWall)   z=3

SpatialPiece(Head)       z=1.2
SpatialPiece(Body)       z=1.5
SpatialPiece(Body)       z=2.3
SpatialPiece(Tail)       z=2.7
```

This is where semantic hierarchy and drawing order separate.

The rule is:

> **React ownership does not determine depth ordering. World position
> does.**

------------------------------------------------------------------------

# 11. Formal Camera

The Camera has its own continuous world position:

``` ts
class Camera {
  position = {
    x: 0,
    y: 0,
    z: 0
  }

  focalLength = 1
  near = 0.01
}
```

The camera can move in all three Symbolics dimensions:

``` ts
camera.position.x += 10
camera.position.y += 10
camera.position.z += 0.1
```

Moving `x` and `y` pans through the level.

Moving `z` moves through depth.

This is different from globally scaling an SVG because objects at
different depths respond differently.

------------------------------------------------------------------------

# 12. Camera-relative position

The camera first turns a world position into a camera-relative position:

``` ts
const x = point.x - camera.position.x
const y = point.y - camera.position.y
const depth = point.z - camera.position.z
```

If increasing `z` means farther into the world, then:

``` text
camera z = 0

object z=1      near
object z=2
object z=5
object z=10     far
```

The camera-relative `depth` is used both for projection and for drawing
order.

------------------------------------------------------------------------

# 13. Perspective projection

A deliberately simple perspective projection can use:

``` ts
const scale =
  camera.focalLength / depth
```

followed by:

``` ts
const screenX = x * scale
const screenY = y * scale
```

So the Camera transforms:

``` text
WORLD

{x,y,z}

    ↓

CAMERA

relative {x,y,depth}

    ↓

PROJECTION

{screenX,screenY,scale,depth}
```

The same flat SVG graphic can then be transformed using the projected
values.

------------------------------------------------------------------------

# 14. Near plane

A spatial piece should not be rendered when it reaches or passes behind
the camera.

For example:

``` ts
if (depth <= camera.near) {
  return null
}
```

This avoids division by zero and prevents graphics behind the camera
from being projected incorrectly.

------------------------------------------------------------------------

# 15. RenderPiece

After projection, a `SpatialPiece` becomes a renderable piece.

Conceptually:

``` ts
type RenderPiece = {
  x: number
  y: number
  scale: number
  rotation: number
  depth: number
  element: React.ReactNode
}
```

This is no longer a world object.

It describes how one flat graphic should appear to the current camera.

The distinction is:

``` text
SpatialPiece
    object in Symbolics world

RenderPiece
    projected object ready to draw
```

------------------------------------------------------------------------

# 16. Scene ordering

SVG uses painter's ordering: later SVG elements appear over earlier
elements.

The Scene therefore sorts projected pieces from far to near.

For example:

``` text
Cave       depth 4
Body       depth 3.7
Body       depth 3.2
Cave       depth 3
Body       depth 2.8
Body       depth 2.4
Cave       depth 2
```

is rendered in that order.

This allows one dragon to pass through multiple cave depths:

``` text
far

Cave wall
Dragon Body
Dragon Body
Cave wall
Dragon Body
Dragon Body
Cave wall

near
```

The dragon remains one game object while its graphics participate
individually in global depth ordering.

------------------------------------------------------------------------

# 17. Why the old G3 responsibilities are separated

The original `G3` idea was useful because it established that ordinary
SVG could be positioned in a 2.5D space.

However, one component should not have to own all of these concerns:

``` text
world position
perspective
SVG transform
depth ordering
local rotation
```

The formal v3 model separates them:

``` text
Spatial
    one flat object at one position

SpatialGroup
    relative / hierarchical positioning

Camera
    observation and perspective projection

Scene
    collection and depth ordering

RenderPiece
    final projected SVG piece
```

`G3` can remain as a compatibility adapter while existing debug/formula
work is migrated.

------------------------------------------------------------------------

# 18. Graphics versus mathematics

A major design goal is to keep mathematical code independent from
rendering code.

For example, navigation mathematics should be able to produce:

``` ts
{
  x: 120,
  y: 80
}
```

without importing React or knowing about SVG.

A depth concern can turn this into:

``` ts
{
  x: 120,
  y: 80,
  z: 1.5
}
```

A graphics concern can associate that position with:

``` tsx
<BodyGraphic />
```

A Camera can project it.

The Scene can order it.

This creates a need-to-know flow:

``` text
Navigation
knows curves and level geometry

       ↓

Depth
knows depth behavior

       ↓

Graphics
knows SVG appearance

       ↓

Camera
knows observation/projection

       ↓

Scene
knows draw ordering
```

No concern needs to understand the implementation of every other
concern.

------------------------------------------------------------------------

# 19. Compound Classes

Compound Classes organize what a larger Symbolics object is made from.

The intended composition style follows the Compound Class architecture
used in the project family:

``` ts
const Dragon =
  compose(BaseDragon)()

    .part("curve", CurvePart)
    .part("navigation", NavigationPart)
    .part("depth", DepthPart)
    .part("body", BodyPart)
    .part("graphics", GraphicsPart)

    .body(/* orchestration */)

    .view(DragonView)

    .build()
```

The daisy chain describes the structure of the object.

The basic roles are:

``` text
.part(...)
    add an isolated concern

.body(...)
    define orchestration / behavior of the complete object

.view(...)
    define the React-facing view

.build()
    produce the completed Compound Class
```

A Compound Class therefore answers:

> **What concerns constitute this object?**

------------------------------------------------------------------------

# 20. Parts

A Part owns one concern and its relevant state/operations.

For a future Dragon, useful Parts may include:

``` text
CurvePart
    curve mathematics

EndpointPart
    curve endpoint mathematics

NavigationPart
    level / triangle navigation

DepthPart
    movement through depth

BodyPart
    body-chain state and placement

GraphicsPart
    conversion of game state into graphical descriptions
```

These are architectural responsibilities, not a requirement that every
tiny function become a Part.

A Part should exist when a concern has a meaningful boundary, state,
vocabulary, or implementation that should remain independent from other
concerns.

------------------------------------------------------------------------

# 21. Example: CurvePart

A curve Part can contain mathematical operations:

``` ts
class CurvePart {
  correct(position, angle, target) {
    // curve correction mathematics

    return curve
  }

  positionAt(curve, t) {
    // sample mathematical curve

    return {
      x: ...,
      y: ...
    }
  }
}
```

It should not know:

``` text
SVG
React
camera position
perspective
cave graphics
```

------------------------------------------------------------------------

# 22. Example: DepthPart

Depth is a separate concern.

Conceptually:

``` ts
class DepthPart {
  depthAt(t) {
    return ...
  }
}
```

This allows the main navigation path to remain fundamentally
two-dimensional.

Symbolics can model:

``` text
curve(t) → {x,y}

depth(t) → z
```

and combine them into:

``` text
position(t) → {x,y,z}
```

This is a useful definition of Symbolics' 2.5D world:

> **2D navigation + continuous 1D depth = 2.5D position.**

------------------------------------------------------------------------

# 23. Example: GraphicsPart

A Graphics Part should work from already-computed state.

For example:

``` ts
class GraphicsPart {
  body(pose) {
    return {
      position: pose.position,
      rotation: pose.angle,
      graphic: <BodyGraphic />
    }
  }
}
```

It should not contain the curve-correction formula.

Its job is to answer:

> Given this game state, what should be drawn?

------------------------------------------------------------------------

# 24. Compound Functions

Compound Functions solve a different problem from Compound Classes.

Compound Classes compose **concerns**.

Compound Functions compose **closures and behavior between concerns**.

The official Symbolics definition is:

> A Compound Function is a structured reusable recipe built from an α →
> β → γ construction. α is defined inline at the β call site. β owns a
> concern/closure and returns γ inside that closure. γ always calls α.
> The resulting γ is the reusable callable recipe.

The purpose is separation of concerns on a need-to-know basis.

------------------------------------------------------------------------

# 25. Official α → β → γ rules

The rules are:

1.  **α is supplied inline when β is called.**
2.  **α is not a separately predefined Compound Function stage.**
3.  **β belongs to the concern that is wrapping or extending the
    behavior.**
4.  **β captures the closure/context belonging to that concern.**
5.  **β returns γ.**
6.  **γ is defined inside β's closure.**
7.  **γ always calls α.**
8.  **The returned γ is the reusable recipe.**
9.  **Compound Functions can be combined to create structured
    compositions of closures.**
10. **The goal is need-to-know separation, not merely function piping.**

The canonical shape is therefore:

``` ts
class SomePart {
  beta(alpha) {

    // β closure

    return (...args) => {

      // γ

      const result = alpha(...args)

      // behavior belonging to this Part

      return result
    }
  }
}
```

But the actual α is supplied inline:

``` ts
const recipe = part.beta(
  value => otherConcern.operation(value)
)
```

`recipe` is γ.

------------------------------------------------------------------------

# 26. Why the earlier alphaMove/gammaMove style is not canonical

An earlier interpretation looked roughly like:

``` ts
alphaMove() {
  ...
}

betaMove(alpha) {
  ...
}

gammaMove() {
  return this.betaMove(this.alphaMove())
}
```

That is not the official Compound Function model.

It prematurely turns α and γ into separately named predefined functions.

The intended construction is in-place:

``` ts
const move = control.move(
  entity => velocity.move(entity)
)
```

where the inline function is α, `control.move` is β, and the function
returned by `control.move` is γ.

------------------------------------------------------------------------

# 27. Need-to-know boundaries

The most important question when designing a Compound Function is not:

> Which Part should this Part receive?

Instead ask:

> **What is the smallest α that this β needs?**

For example, Graphics should not receive an entire `MotionPart` if it
only needs a pose.

Prefer:

``` ts
() => Pose
```

over:

``` ts
graphics.motion = motionPart
```

Likewise Navigation should not receive the entire mesh system if it only
needs:

``` ts
(position: Position2D) => Target
```

The inline α acts as a deliberately narrow window into another concern.

------------------------------------------------------------------------

# 28. Compound Function example: adding depth

Suppose curve mathematics can produce a 2D position:

``` ts
curve.positionAt(t)
// → {x,y}
```

A `DepthPart` can provide β:

``` ts
class DepthPart {
  apply(alpha) {
    return t => {
      const point = alpha(t)

      return {
        ...point,
        z: this.depthAt(t)
      }
    }
  }

  depthAt(t) {
    return ...
  }
}
```

Construct the Compound Function:

``` ts
const spatialPosition = depth.apply(
  t => curve.positionAt(t)
)
```

Here:

``` text
α
    t => curve.positionAt(t)

β
    depth.apply(alpha)

γ
    spatialPosition
```

Calling:

``` ts
spatialPosition(t)
```

first calls α and then extends its result with depth.

The curve concern never needs to know that depth exists.

------------------------------------------------------------------------

# 29. Compound Function example: navigation and curve correction

A navigation concern can determine a target while allowing another
concern to decide how to reach it.

For example:

``` ts
class NavigationPart {
  navigate(alpha) {
    return position => {
      const target = this.findTarget(position)

      return alpha(target)
    }
  }
}
```

Construct it with an inline α:

``` ts
const navigate = navigation.navigate(
  target =>
    curve.correct(
      dragon.position,
      dragon.angle,
      target
    )
)
```

The concerns now know only what they need:

``` text
NavigationPart
    knows how to choose target

        ↓ target

CurvePart
    knows how to create corrected curve
```

Navigation does not know the curve-correction implementation.

Curve mathematics does not know why that target was chosen.

------------------------------------------------------------------------

# 30. Compound Function example: graphics observing motion

Suppose graphics needs only the current pose.

Do not expose the whole motion concern.

A graphics β could be:

``` ts
class GraphicsPart {
  body(alpha) {
    return () => {
      const pose = alpha()

      return {
        position: pose.position,
        rotation: pose.angle,
        graphic: <BodyGraphic />
      }
    }
  }
}
```

Construct:

``` ts
const bodyGraphic = graphics.body(
  () => motion.pose()
)
```

The Graphics Part receives only:

``` ts
() => Pose
```

not the whole `MotionPart`.

------------------------------------------------------------------------

# 31. Compound Functions can compose

The γ returned by one recipe can participate in the inline α supplied to
another β.

For example:

``` ts
const target = navigation.target(
  position => mesh.exitAt(position)
)
```

Then:

``` ts
const corrected = curve.follow(
  position => {
    const next = target(position)
    return next
  }
)
```

Then:

``` ts
const spatial = depth.apply(
  t => corrected(t)
)
```

Conceptually:

``` text
Mesh concern
      │
      │ α₁
      ▼
Navigation β₁
      │
      │ γ₁
      ▼
Curve β₂
      │
      │ γ₂
      ▼
Depth β₃
      │
      ▼
γ₃
```

This is why they are called Compound Functions: larger behavior is
constructed from nested closure-producing recipes.

------------------------------------------------------------------------

# 32. Compound Functions are not ordinary pipelines

A simple pipeline usually means:

``` text
A → B → C → D
```

where each function merely transforms one value into another.

A Compound Function is more general.

β can have state and can perform behavior before or after α:

``` ts
beta(alpha) {
  return input => {

    this.before(input)

    const result = alpha(input)

    this.after(result)

    return result
  }
}
```

β can branch:

``` ts
beta(alpha) {
  return input => {

    if (this.enabled) {
      return alpha(input)
    }

    return input
  }
}
```

β can call α with a deliberately reduced or transformed contract.

The defining property is the closure relationship:

``` text
β captures its concern
β receives α
β returns γ
γ calls α
```

------------------------------------------------------------------------

# 33. Daisy-chain syntax for Compound Functions

The boilerplate can eventually be automated with a recipe builder.

For example:

``` ts
const navigate =
  recipe()

    .through("mesh", mesh =>
      position => mesh.exit(position)
    )

    .through("curve", curve =>
      target => curve.correct(target)
    )

    .through("motion", motion =>
      path => motion.follow(path)
    )

    .build()
```

The important requirement is that this must not become a flattened
generic pipeline.

Internally, each `.through()` should construct a real β/γ closure.

Conceptually the builder constructs from the inside outward:

``` ts
build() {
  let alpha = value => value

  for (const step of [...steps].reverse()) {
    const next = alpha
    alpha = step.make(step.part, next)
  }

  return alpha
}
```

Every iteration creates another lexical closure.

------------------------------------------------------------------------

# 34. Full and shorthand Compound Function syntax

A useful future API can provide both a full form and a shorthand.

Full form:

``` ts
.recipe("navigate")

  .part("mesh", (mesh, alpha) => {
    return position => {
      const target = mesh.exit(position)

      return alpha(target)
    }
  })

  .part("curve", (curve, alpha) => {
    return target => {
      const corrected = curve.correct(target)

      return alpha(corrected)
    }
  })

.end()
```

This explicitly exposes β and γ construction.

For simple transform-like recipes, shorthand can be:

``` ts
.through("mesh", mesh =>
  position => mesh.exit(position)
)
```

The shorthand can expand internally to:

``` ts
(mesh, alpha) => {
  return position => {
    return alpha(
      mesh.exit(position)
    )
  }
}
```

This preserves the official Compound Function semantics while reducing
repetitive code.

------------------------------------------------------------------------

# 35. Compound Classes and Compound Functions together

The two abstractions solve different scales of organization.

``` text
Compound Class
    composition of concerns

Compound Function
    composition of behavior between concerns
```

For example:

``` ts
const Dragon =
  compose(BaseDragon)()

    .part("mesh", MeshPart)
    .part("curve", CurvePart)
    .part("depth", DepthPart)
    .part("motion", MotionPart)
    .part("graphics", GraphicsPart)

    .recipe("navigate")
      .through("mesh", ...)
      .through("curve", ...)
      .through("depth", ...)
      .through("motion", ...)
      .end()

    .view(DragonView)

    .build()
```

This gives one compositional language two jobs:

``` text
.part(...)
    what the object contains

.recipe(...)
    how selected concerns cooperate

.view(...)
    how the result enters React

.build()
    construct the final class
```

------------------------------------------------------------------------

# 36. Suggested Symbolics Parts

The exact Parts can evolve with the formulas, but the current
architecture naturally suggests the following responsibilities.

## Scene / composition side

### CameraPart

Owns:

``` text
camera position
focal length
near plane
world-to-camera conversion
perspective projection
```

It should not know dragon navigation or cave logic.

### Spatial / Scene concern

Owns:

``` text
collection of SpatialPieces
flattening spatial hierarchy
camera-relative depth
global far-to-near ordering
conversion to RenderPieces
```

### Time / Layer concern

Owns the existing composition behavior:

``` text
time
delta
begin
end
continuous
```

It remains separate from spatial depth.

------------------------------------------------------------------------

# 37. Suggested Dragon Parts

## CurvePart

Owns:

``` text
curve correction formula
curve sampling
curve mathematical representation
```

## EndpointPart

Owns:

``` text
curve endpoint formula
endpoint constraints
endpoint-related mathematical state
```

This may remain separate from `CurvePart` while the formulas are being
developed if the distinction is useful.

## NavigationPart

Owns:

``` text
desired movement
target selection
navigation state
coordination of level navigation
```

It should depend on narrow recipes rather than directly owning all mesh
and curve internals.

## MeshNavigationPart

Owns:

``` text
triangle mesh navigation
wall / triangle relationships
finding an exit or next target from the current triangle
```

It should output navigation information, not graphics.

## DepthPart

Owns:

``` text
continuous z
depth transitions
depthAt(...)
```

It can combine with 2D curve output through a Compound Function.

## BodyPart

Owns:

``` text
dragon body-chain state
body spacing
individual Body poses
head/body/tail relationships
```

Its result should be a set or chain of poses, not projected SVG
coordinates.

## GraphicsPart

Owns:

``` text
mapping game state to graphics descriptions
Body / Head / Tail visual selection
other visual-only properties
```

It should not own navigation mathematics.

------------------------------------------------------------------------

# 38. Suggested Cave Parts

The cave can use the same generic spatial system.

A cave-specific concern may own:

``` text
wall definitions
holes
which wall belongs at which z
level-specific visual construction
```

But the cave should not implement its own perspective or sorting.

It should ultimately describe flat graphics at positions:

``` text
Cave logic
      ↓
Spatial pieces
      ↓
same Camera
      ↓
same Scene ordering
```

That common pipeline is what allows cave pieces and dragon pieces to
interleave correctly.

------------------------------------------------------------------------

# 39. Example final Dragon flow

A future Dragon update may conceptually look like:

``` text
MeshNavigationPart
        │
        │ target
        ▼
NavigationPart
        │
        ▼
CurvePart
        │
        │ corrected 2D curve
        ▼
EndpointPart
        │
        ▼
DepthPart
        │
        │ {x,y,z}
        ▼
BodyPart
        │
        │ Pose[]
        ▼
GraphicsPart
        │
        ▼
DragonView
        │
        ▼
SpatialGroup
 ├── Spatial Head
 ├── Spatial Body
 ├── Spatial Body
 ├── Spatial Body
 └── Spatial Tail
```

The exact mathematical sequence can change without requiring the
rendering architecture to change.

------------------------------------------------------------------------

# 40. Example final rendering flow

All game objects eventually enter the same rendering pipeline:

``` text
Dragon
  └─ SpatialPieces ─┐

Cave
  └─ SpatialPieces ─┼──→ flatten
                    │
Effects             │
  └─ SpatialPieces ─┘
                         │
                         ▼
                      Camera
                         │
                       project
                         │
                         ▼
                   RenderPieces
                         │
                         ▼
                   sort by depth
                         │
                         ▼
                        SVG
```

The Scene does not need to know what a Dragon or Cave is.

It only needs spatial pieces.

------------------------------------------------------------------------

# 41. Architectural invariants

These rules should remain stable as Symbolics grows.

### 1. A visible Spatial piece occupies one depth

One `Spatial` is one indivisible flat graphic.

### 2. `SpatialGroup` is a coordinate system, not a render group

It transforms descendant positions but does not force them to render
together.

### 3. World position is independent from the camera

Moving the camera does not change object world positions.

### 4. Projection belongs to Camera

Game objects do not calculate their own perspective.

### 5. Global ordering belongs to Scene

React parent/child ownership does not determine depth ordering.

### 6. `Layer` is not depth

Composition time and spatial depth remain separate concepts.

### 7. Mathematics does not return SVG

Math returns mathematical/game state.

### 8. Graphics does not own navigation mathematics

Graphics consumes already-computed state.

### 9. Parts expose the smallest useful concern

Avoid giving one Part broad access to unrelated Parts.

### 10. Compound Functions use need-to-know contracts

Ask:

> What is the smallest α this β needs?

### 11. α is inline

Do not turn α into a separately predefined stage merely to fit the
pattern.

### 12. β returns γ

The closure created by β is fundamental to the architecture.

### 13. γ calls α

Without that relationship, it is not this Compound Function
construction.

------------------------------------------------------------------------

# 42. Mental model

A concise way to think about Symbolics v3 is:

``` text
FORMULAS
    decide movement

PARTS
    isolate concerns

COMPOUND FUNCTIONS
    selectively connect concerns

COMPOUND CLASSES
    assemble complete objects

SPATIAL
    gives flat graphics world positions

SPATIAL GROUP
    gives spatial children a shared coordinate system

CAMERA
    observes the world

SCENE
    orders what the camera sees

SVG
    draws the result
```

The architecture deliberately stops short of becoming a general-purpose
3D engine.

Symbolics gets the features it needs for its 2.5D world---continuous
depth, camera movement in depth, perspective/parallax, hierarchical
positioning, and global depth ordering---while preserving ordinary React
and SVG graphics and keeping the mathematical game code separate from
rendering.
