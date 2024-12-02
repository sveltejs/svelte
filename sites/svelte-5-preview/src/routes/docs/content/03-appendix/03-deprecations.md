---
title: Deprecations
---

Aside from the [breaking changes](/docs/breaking-changes) listed on the previous page, Svelte 5 should be a drop-in replacement for Svelte 4. That said, there are some features that we will remove in a future major version of Svelte, and we encourage you to update your apps now to avoid breaking changes in future.

## beforeUpdate and afterUpdate

`beforeUpdate(fn)` schedules the `fn` callback to run immediately before any changes happen inside the current component. `afterUpdate(fn)` schedules it to run after any changes have taken effect.

These functions run indiscriminately when _anything_ changes. By using `$effect.pre` and `$effect` instead, we can ensure that work only happens when the things we care about have changed. The difference is visible in this example — [with `afterUpdate`](/#H4sIAAAAAAAAE21STW-DMAz9K140CSpVtJddUmDaj5i0aezAwKBI-VJi6CqU_74AY-WwiyPbz37PdibWCYme8Y-J6Voh4-zFWnZkdLOz40eUhNH3ZnDNHMl944SlstIVCWWNI5ig7gjdq21rQgjQOaMgWUuTSwRGqESCxhjXeijg0VNEphN8czgf4RYthMNlwxEqi66mweEd_HTeARzq9p5KsixL1uyGsA7HCNh1-tWxU5qmByhKmJY6aoz2RmImTZ8mbtBa6H4_10ZAqxUdpHudD0WxkB62fhVtKvewclX2DEmPRDPFtXYKXQL8Hop7kjG08dH_w8REmJ9lcfnpfhadr6vnV6FbcwWjuTKDR2VGLKYUl6n_brEcAbNGCtT0thxj897jLQOc1p5C2yFuPn6LomKu1j1WDL4iAx9rOcTGO3kBYk1uy2lZQchPtoxfSJlWdAJbxskNGD7DD-pLlz59AgAA), the callback runs on every `mousemove` event, whereas [with `$effect`](/#H4sIAAAAAAAAE21SwW6EIBD9lSnZRDfZuHvphapN_6JN7cHqaEgQCIxuG8O_F7VUDw0JZOY93gxvmFknJDrG32em6gEZZy_GsAujb7MEbkJJGGKnR9ssmdw1VhgqK1WRRIJGa9s6KODkqCZMZ_jicLvAd9jBn58ij3AwaGsaLe7kx9uBYFG1O5RkWZZsaGQYi1MgHJQWOIAn7DpsKE3PUJQwr3eo0cppiZnUfZrYUSmhevhlRmHadtFBeuzvoSjWYueoVVHs7kgrt46eIemRaJG_13ZAmwDfU8EfGVKxHv3_iAD45VgNy6-7xyrfRsDvQrX6DlrxQY8OBz1hMae4vvhvBqv5mDVSoKLXdQgxegMf1nXTFMqMwfEw46JitlY9Vgw-QwU-1XIMwof2PIQ7uSnn1QKfX00Z_sOgW9EJbBknO6L_8D9aLfICSgIAAA==), the function only runs when `temperature` changes:

```diff
<script>
-	import { afterUpdate } from 'svelte';

	let coords = $state({ x: 0, y: 0 });
	let temperature = $state(50);
	let trend = $state('...');

	let prev = temperature;

-	afterUpdate(() => {
-		console.log('running afterUpdate');
+	$effect(() => {
+		console.log('running $effect');

		if (temperature !== prev) {
			trend = temperature > prev ? 'getting warmer' : 'getting cooler';
			prev = temperature;
		}
	});
</script>

<svelte:window on:mousemove={(e) => coords = { x: e.clientX, y: e.clientY } } />

<input type="range" bind:value={temperature} >
<p>{trend}</p>
```

Note that using `$effect` and `$effect.pre` will put you in [runes mode](/docs/runes) — be sure to update your props and state accordingly.

## `createEventDispatcher`

`createEventDispatcher` returns a function from which you can dispatch custom events. The usage is somewhat boilerplate-y, but it was encouraged in Svelte 4 due to consistency with how you listen to dom events (via `on:click` for example).

Svelte 5 introduces [event attributes](/docs/event-handlers) which deprecate event directives (`onclick` instead of `on:click`), and as such we also encourage you to use callback properties for events instead:

```diff
<script>
-	import { createEventDispatcher } from 'svelte';
-	const dispatch = createEventDispatcher();
+	let { greet } = $props();

-	function greet() {
-		dispatch('greet');
-	}
</script>

<button
-	on:click={greet}
+	onclick={greet}
>greet</button>
```

When authoring custom elements, use the new [host rune](/docs/runes#$host) to dispatch events (among other things):

```diff
<script>
-	import { createEventDispatcher } from 'svelte';
-	const dispatch = createEventDispatcher();

	function greet() {
-		dispatch('greet');
+		$host().dispatchEvent(new CustomEvent('greet'));
	}
</script>

<button
-	on:click={greet}
+	onclick={greet}
>greet</button>
```

Note that using `$props` and `$host` will put you in [runes mode](/docs/runes) — be sure to update your props and state accordingly.

## `<svelte:component>` in runes mode

In previous versions of Svelte, the component constructor was fixed when the component was rendered. In other words, if you wanted `<X>` to re-render when `X` changed, you would either have to use `<svelte:component this={X}>` or put the component inside a `{#key X}...{/key}` block.

In Svelte 5 this is no longer true — if `X` changes, `<X>` re-renders.

In some cases `<object.property>` syntax can be used as a replacement; a lowercased variable with property access is recognized as a component in Svelte 5.

For complex component resolution logic, an intermediary, capitalized variable may be necessary. E.g. in places where `@const` can be used:

```diff
{#each items as item}
-	<svelte:component this={item.condition ? Y : Z} />
+	{@const Component = item.condition ? Y : Z}
+	<Component />
{/each}
```

A derived value may be used in other contexts:

```diff
<script>
	...
	let condition = $state(false);
+	const Component = $derived(condition ? Y : Z);
</script>
- <svelte:component this={condition ? Y : Z} />
+ <Component />
```

## `immutable`

The `immutable` compiler option is deprecated. Use runes mode instead, where all state is immutable (which means that assigning to `object.property` won't cause updates for anything that is observing `object` itself, or a different property of it).

## `context="module"`

`context="module"` is deprecated, use the new `module` attribute instead:

```diff
- <script context="module">
+ <script module>
	...
</script>
```
