---
title: .svelte.js and .svelte.ts files
use_cases: "reusable reactive logic, shared state modules, composable reactive utilities, reactive helper functions"
---

Besides `.svelte` files, Svelte also operates on `.svelte.js` and `.svelte.ts` files.

These behave like any other `.js` or `.ts` module, except that you can use runes. This is useful for creating reusable reactive logic, or sharing reactive state across your app (though note that you [cannot export reassigned state]($state#Passing-state-across-modules)).

> [!LEGACY]
> This is a concept that didn't exist prior to Svelte 5
