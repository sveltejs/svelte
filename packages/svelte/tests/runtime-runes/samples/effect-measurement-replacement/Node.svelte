<script>
	import { untrack } from 'svelte';

	let { node, observe } = $props();
	let measured = $derived(node.measured);
	// This cache must see the measured state before Relayout replaces the nodes.
	let initialized = $derived(measured);

	$effect(() => {
		if (!initialized) untrack(observe);
	});
</script>

<div style:visibility={measured ? 'visible' : 'hidden'}>A</div>
