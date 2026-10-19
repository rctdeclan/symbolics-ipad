# 0001: Compose Independent Parts with Compound Classes

Status: established design; structural builder implemented; feature adoption partial.

## Decision

Use Compound Classes to compose Parts representing distinct concerns. A Part
encapsulates its own behavior and context. The enclosing class orchestrates
capabilities, without requiring Parts to know unrelated Parts. In particular,
keep mathematics and graphics independent. New substantive features should
reuse the Compound architecture rather than introduce a competing object system.
This is composition of concerns, not a replacement with conventional inheritance.

## Source evidence and actual API

`src/compound/compound.jsx` exports
`compose(Base)().part(name, Part).body(define).view(View).build()`.
The resulting class extends Base, forwards constructor arguments, constructs
function-valued Parts with `new Part(this)`, stores them in `this.parts`, then
assigns body definitions. `getPart(name)` retrieves a Part; `render(props)`
creates the configured React view with `compound={this}` or returns null.
The existing Base extension is an implementation detail to preserve, not an
invitation to replace composition with a hierarchy of concern subclasses.

## Consequences and guidance

Identify a meaningful concern before creating a Part. Keep its local operations
and state together; use the enclosing `.body(...)` to assemble capabilities.
Connect concerns through narrow Compound Function contracts such as `() => Pose`,
not by handing graphics an entire navigation object. A simple math helper does
not need to become a Part solely to conform to the vocabulary.

## Gaps and open questions

The builder supplies the owner and therefore permits direct cross-Part access;
independence is not enforced by a sandbox or type system. Supplied non-function
Part values are shared as-is, unlike separately constructed Part instances.
The live Dragon is still a function component combining math and graphics.
No automatic React subscription or reactive Part state protocol is implemented;
the update contract for future composed game objects remains to be decided.

Protection: core tests check Base construction, independent constructed Parts,
orchestration and the no-view render fallback. See [architecture](../ARCHITECTURE.md).
