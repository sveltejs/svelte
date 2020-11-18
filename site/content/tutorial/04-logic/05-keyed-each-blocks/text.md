---
title: Keyed each blocks
---

By default, when you add an element to the array that the `each` block iterates over, it will add an item at the *end* of the block instead of at the same position as the element in the array, and update the attributes of the existing items. This means that if you add an element to the array anywhere other than at the end, this leads to each item corresponding to a different element of the array than the one it was created for. The same goes for removing an element from the array. That might not be what you want.

It's easier to understand with an example. For each element of the array, <code>#each</code> creates one `<Thing>` component which you can see as a row. The initial value corresponds to the element of the original array for which the component was created, while the current value shows the element of the array it corresponds to currently. The expected behavior would be that for a component both values always match.

Click the 'Remove first element' button a few times. Notice how it's removing `<Thing>` components from the end and updating the prop for those that remain. Instead, we'd like the button to remove only the first `<Thing>` component and leave the rest unaffected.

To do that, we specify a unique identifier for the `each` block in parentheses:

```html
{#each array as element (element.id)}
	<Thing current={element.id}/>
{/each}
```

The `(element.id)` tells Svelte how to figure out what changed.

> You can use any object as the key, as Svelte uses a `Map` internally — in other words you could do `(element)` instead of `(element.id)`. Using a string or number is generally safer, however, since it means identity persists without referential equality, for example when updating with fresh data from an API server.
