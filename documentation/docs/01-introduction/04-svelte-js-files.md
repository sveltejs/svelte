---
title: .svelte.js and .svelte.ts files
---

Besides `.svelte` files, Svelte also operates on `.svelte.js` and `.svelte.ts` files.

These behave like any other `.js` or `.ts` module, except that you can use runes. This is useful for creating reusable reactive logic, or sharing reactive state across your app.

> [!LEGACY]
> This is a concept that didn't exist prior to Svelte 5

### Sharing `$state` Across Modules

When exporting reactive state from a module using `$state`, ensure it remains reactive and predictable by following one of these approaches:

- **Export a function**: Return the `$state` value from a function to encapsulate and provide access to it.
- **Export an object**: Use `$state` with an object and mutate its properties to trigger reactivity.

Reassigning an exported `$state` variable (e.g., `count = 5`) in the module where it’s defined is not allowed, as it breaks reactivity tracking. Instead, choose one of these patterns:

```javascript
// Option 1: Export a function
export function getCount() {
  return $state(0);
}

// Option 2: Export an object and mutate properties
export let state = $state({ count: 0 });
// Later: state.count += 1; (valid mutation)
```

> [!NOTE] You cannot reassign an exported $state variable (e.g., count = 5) in its module. Either export a function returning the state or use an object and mutate its properties to maintain reactivity. See [Compiler Errors: state_invalid_export](https://svelte.dev/docs/svelte/compiler-errors#state_invalid_export) for Svelte-specific details, and [MDN: JavaScript export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) for how JavaScript module bindings work.
