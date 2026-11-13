<script>
	import { getAbortSignal } from 'svelte';

	let { x, push } = $props();

	let value = $derived(await push('value', x, getAbortSignal()));
	const snapshot = x;

	console.log(`continued with ${value} ${snapshot}`);
</script>

<p>{value} {snapshot}</p>
