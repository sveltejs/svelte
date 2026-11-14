<script>
	import { getAbortSignal } from 'svelte';
	let { x, push, label } = $props();
	let value = $derived(await push(label, x, getAbortSignal()));
	const snapshot = x;
	console.log(`continued ${label} with ${value} ${snapshot}`);
</script>

<p>{label}: {value} {snapshot}</p>
