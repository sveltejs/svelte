---
'svelte': patch
---

fix: coerce symbols to empty string in `set_text`

Under `experimental.async`, `$bindable` props can briefly surface `Symbol(UNINITIALIZED)`.
`set_text` treated symbols as already-stringifiable values, then threw when assigning
`text.nodeValue = \`${str}\``. Treat symbols like nullish values so text nodes stay stable.
