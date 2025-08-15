<script lang="ts">
	import { resolve } from './main.svelte';

	const foo = $derived(await new Promise((r) => resolve.push(() => r('foo'))));
	const bar = $derived(await new Promise((r) => resolve.push(() => r('bar'))));
</script>

<p>{foo} {bar}</p>
