---
title: Keyed each blocks
---

By default, when you add / remove an item from the iterable that the `each` block iterates over, it will add / remove the component instance at the *end* of the block instead of the corresponding instance. If you add / remove items from anywhere other than the end of the iterable, this leads to each component instance corresponding to a different element of the iterable than the one it was first created for. This might not be what you want.

It's easier to understand with an example. For each element of the array, <code>#each</code> creates one instance of the `<Thing>` component seen as a row. The initial value shows to which element of the original array the instance corresponded when it was created, while the current value shows which element of the current array it corresponds to now. The expected behavior would be that both values match.

Click the 'Remove first element' button a few times, and notice that it's removing `<Thing>` components from the end, and updating the value for those that remain. Instead, we'd like to remove the first `<Thing>` component and leave the rest unaffected.

To do that, we specify a unique identifier for the `each` block in parentheses:

```html
{#each array as element (element.id)}
	<Thing current={element.id}/>
{/each}
```

The `(element.id)` tells Svelte how to figure out what changed.

> You can use any object as the key, as Svelte uses a `Map` internally — in other words you could do `(element)` instead of `(element.id)`. Using a string or number is generally safer, however, since it means identity persists without referential equality, for example when updating with fresh data from an API server.
