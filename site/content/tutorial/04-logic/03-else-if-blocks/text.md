---
title: Else-if blocks
---

Multiple conditions can be 'chained' together with `else if`:

```html
{#if x > 10}
	<p>{x} is greater than 10</p>
{:else if 5 > x}
	<p>{x} is less than 5</p>
{:else}
	<p>{x} is between 5 and 10</p>
{/if}
```

Also, you can add some increment function to variable `x` so it will dynamically change the condition output.

Add the `Add number` button with event function `incrementNumber`:

```html
<button on:click={incrementNumber}>
	Add number
</button>
```
Change variable `x` to increment itself inside the function `incrementNumber`:

```js
function incrementNumber() {
	x += 1;
};
```

Voila! Now you can see the condition output changes as `Add number` constantly clicked.

