---
title: Group inputs
---

If you have multiple inputs relating to the same value, you can use `bind:group` along with the `value` attribute. Radio inputs in the same group are mutually exclusive; checkbox inputs in the same group form an array of selected values.

Add `bind:group` to each input:

```html
<input type=radio bind:group={scoops} name="scoops" value={1}>
```

In this case, we could make the code simpler by moving the checkbox inputs into an `each` block. First, add a `menu` variable to the `<script>` block...

```js
let menu = [
	'Cookies and cream',
	'Mint choc chip',
	'Raspberry ripple'
];
```

...then replace the second section:

```html
<h2>Flavours</h2>

{#each menu as flavour}
	<label>
		<input type=checkbox bind:group={flavours} name="flavours" value={flavour}>
		{flavour}
	</label>
{/each}
```

It's now easy to expand our ice cream menu in new and exciting directions.