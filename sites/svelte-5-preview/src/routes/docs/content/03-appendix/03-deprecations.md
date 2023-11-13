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
