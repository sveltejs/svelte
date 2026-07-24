---
"svelte": patch
---

fix: prevent magic-string crash in migrator when a `<!--@component-->` comment is combined with an `export { x as y }` alias
