# 0002: Part-owned Compound Functions (alpha -> beta -> gamma)

Status: established design; minimal helper and recipe shorthand implemented.

## Decision

Preserve the specific alpha -> beta -> gamma construction:

- Alpha is an inline function defined at the beta call site.
- Beta is a method of a Part; it captures that Part's context and returns gamma.
- Gamma is defined inside beta, invokes alpha, and is the reusable callable recipe.
- The inline alpha exposes only the capability that beta needs from another
  concern, preserving need-to-know composition.

Do not replace this mechanism with generic callbacks, event buses, dependency
injection or conventional inheritance. It uses functions, but the ownership,
closure construction and continuation relationship are defining constraints.

## Source evidence and actual API

`src/compound/compound.jsx` exports
`compoundFunction = (beta) => (alpha) => beta(alpha)`.
This primitive neither creates Parts nor enforces beta ownership/alpha invocation.
Its generic implementation does not authorize replacing Part-owned Compound
Functions with ordinary callbacks; accepted helper inputs are not the full
architectural contract.
A Part method can implement the construction directly; when passing a method
through the helper, use a wrapper that preserves the Part receiver.

`recipe().through(part, step).build(finalAlpha)` is the existing shorthand for
nested transform closures. It passes an actual part value to each step and
builds right-to-left while transforms execute in declaration order. It does
not implement the proposed `.recipe(...).end()` class DSL. Do not reinterpret
the canonical construction as merely value piping.

## Consequences and remaining work

Create gamma once at the orchestration boundary and reuse it. Part context
stays in beta's closure; unrelated capabilities stay behind the inline alpha.
Use the minimal TypeScript illustration in [architecture](../ARCHITECTURE.md),
which describes the contract without introducing TypeScript into the repository.
Existing source does not enforce these rules mechanically or compose the live
Dragon using them. The helper still accepts standalone functions; that generality
does not supersede the Part-owned design requirement. Tests exercise closure
independence, reusable gamma, Part context, and execution order; review remains
necessary to establish compliance of new feature compositions.
