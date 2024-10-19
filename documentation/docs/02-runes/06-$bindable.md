---
title: $bindable
---

Ordinarily, props go one way, from parent to child. This makes it easy to understand how data flows around your app.

In Svelte, component props can be _bound_, which means that data can also flow _up_ from child to parent. This isn't something you should do often, but it can simplify your code if used sparingly and carefully.

It also means that a state proxy can be _mutated_ in the child.

> [!NOTE] Mutation is also possible with normal props, but is strongly discouraged — Svelte will warn you if it detects that a component is mutating state it does not 'own'.

To mark a prop as bindable, we use the `$bindable` rune:

<!-- prettier-ignore -->
```svelte
/// file: FancyInput.svelte
<script>
	let { value = $bindable(), ...props } = $props();
</script>

<input bind:value={value} {...props} />

<style>
	input {
		font-family: 'Comic Sans MS';
		color: deeppink;
	}
</style>
```

Now, a component that uses `<FancyInput>` can add the [`bind:`](bind) directive ([demo](/playground/untitled#H4sIAAAAAAAAE3WQwWrDMBBEf2URBSfg2nfFMZRCoYeecqx6UJx1IyqvhLUONcb_XqSkTUOSk1az7DBvJtEai0HI90nw6FHIJIhckO7i78n7IhzQctS2OuAtvXHESByEFFVoeuO5VqTYdN71DC-amvGV_MDQ9q6DrCjP0skkWymKJxYZOgxBfyKs4SGwZlxke7TWZcuVoqo8-1P1z3lraCcP2g64nk4GM5S1osrXf0JV-lrkgvGbheR-wDm_g30V8JL-1vpOCZFogpQsEsWcemtxscyhKArfOx9gjps0Lq4hzRVfemaYfu-PoIqqwKPFY_XpaIqj4tYRP7a6M3aUkD27zjSw0RTgbZN6Z8WNs66XsEP03tBXUueUJFlelvYx_wCuI3leNwIAAA==)):

<!-- prettier-ignore -->
```svelte
/// App.svelte
<script>
	import FancyInput from './FancyInput.svelte';

	let message = $state('hello');
</script>

<FancyInput bind:value={message} />
<p>{message}</p>
```

The parent component doesn't _have_ to use `bind:` — it can just pass a normal prop. Some parents don't want to listen to what their children have to say.

In this case, you can specify a fallback value for when no prop is passed at all:

```js
/// file: FancyInput.svelte
let { value = $bindable('fallback'), ...props } = $props();
```
