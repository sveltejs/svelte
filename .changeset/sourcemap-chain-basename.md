---
'svelte': patch
---

fix: correctly chain upstream plugin sourcemaps whose `sources` contain full paths (e.g. from `MagicString.generateMap({ source: id })`) by normalizing source entries to the file basename before remapping
