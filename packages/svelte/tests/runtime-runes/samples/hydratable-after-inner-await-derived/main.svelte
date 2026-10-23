<script lang="ts">
	import { hydratable } from 'svelte';

	let { environment } = $props();
	const key = async (k: string) => k;

	const a = $derived(await hydratable(await key('a'), () => Promise.resolve(environment)));
	const b = $derived(await hydratable(await key('b'), () => Promise.resolve(environment)));
</script>

<p>{a} {b}</p>
