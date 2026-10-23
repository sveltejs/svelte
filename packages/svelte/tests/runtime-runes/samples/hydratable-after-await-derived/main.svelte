<script lang="ts">
	import { hydratable } from 'svelte';

	let { environment } = $props();

	const a = $derived(await hydratable('a', () => Promise.resolve(environment)));
	const b = $derived(await hydratable('b', () => Promise.resolve(environment)));
</script>

<p>{a} {b}</p>
