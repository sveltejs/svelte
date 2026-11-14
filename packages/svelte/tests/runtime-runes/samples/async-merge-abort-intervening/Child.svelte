<script>
	import { getAbortSignal } from 'svelte';
	let { a, x, push } = $props();
	let value = $derived(await push('value', a, getAbortSignal()));
	const snapshot = x;
	console.log(`continued with ${value} ${snapshot}`);
</script>

<p>{value} {snapshot}</p>
