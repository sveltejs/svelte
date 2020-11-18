---
title: Keyed each blocks
---

By default, when you add an element to the array that the `each` block iterates over, it will add an item at the *end* of the block instead of at the same position as the element's index. This means that if you add an element to the array anywhere other than at the end, this leads to each item corresponding to a different element of the array than the one it was first created for. The same goes for removing an element. That might not be what you want.

It's easier to understand with an example. For each element of the array, <code>#each</code> creates one `<Thing>` component which you can see as rows. The initial value shows to which element of the array the component instance corresponded when it was created, while the current value shows which element of the current array it corresponds to now. The expected behavior would be that both values match.

Click the 'Remove first element' button a few times, and notice that it's removing `<Thing>` components from the end, and updating the prop for those that remain. Instead, we'd like to remove the first `<Thing>` component and leave the rest unaffected.

To do that, we specify a unique identifier for the `each` block in parentheses:

```html
{#each array as element (element.id)}
	<Thing current={element.id}/>
{/each}
```

The `(element.id)` tells Svelte how to figure out what changed.

> You can use any object as the key, as Svelte uses a `Map` internally — in other words you could do `(element)` instead of `(element.id)`. Using a string or number is generally safer, however, since it means identity persists without referential equality, for example when updating with fresh data from an API server.
