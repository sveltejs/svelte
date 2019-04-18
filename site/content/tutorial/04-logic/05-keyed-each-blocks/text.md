---
title: Keyed each blocks
---

By default, when you modify the value of an `each` block, it will add and remove items at the *end* of the block, and update any values that have changed. That might not be what you want.

It's easier to show why than to explain. Click the 'Remove first item' button a few times, and notice that it's removing `<Thing>` components from the end and updating the `value` for those that remain. Instead, we'd like to remove the first `<Thing>` component and leave the rest unaffected.

To do that, we specify a unique identifier for the `each` block:

```html
{#each things as thing (thing.id)}
	<Thing value={thing.value}/>
{/each}
```

The `(thing.id)` tells Svelte how to figure out what changed.

> You can use any object as the key, as Svelte uses a `Map` internally — in other words you could do `(thing)` instead of `(thing.id)`. Using a string or number is generally safer, however, since it means identity persists without referential equality, for example when updating with fresh data from an API server.