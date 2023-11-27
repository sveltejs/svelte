---
'svelte': patch
---

Implement CSS nesting support
- [x] CSS rule nesting using `&` prefix (ie `.foo { & div { color: red } }`)
- [x] CSS At-Rules nesting
- [x] CSS rule nesting without `&` type (element) selector (ie. `.foo { div { color: red } }`)
- [x] CSS rule nesting without `&` for CSS Combinators (ie. `.foo { + div { color: red } }`)
- [x] CSS rule nesting without `&` for class & ID selectors (ie. `.foo { .bar { color: red } }`)
- [x] Appending the `&` nesting selector to reverse rule context (ie. `.foo { .bar & { color: red } }`, equiv to `.bar { .foo { color: red } }`)