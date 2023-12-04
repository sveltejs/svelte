---
title: Key blocks
---

Key blocks destroy and recreate their contents when the value of an expression changes.

```svelte
{#key number}
	<span style="display: inline-block" in:fly={{ y: -20 }}>
		{number}
	</span>
{/key}
```

This is useful if you want an element to play its transition whenever a value changes instead of only when the element enters or leaves the DOM.

Wrap the `<span>` element in a key block depending on `number`. This will make the
animation play whenever you press the increment button.
