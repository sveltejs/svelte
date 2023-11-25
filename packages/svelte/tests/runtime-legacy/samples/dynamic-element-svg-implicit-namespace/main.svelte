<script>
	// ensure these are treated as dynamic, despite whatever
	// optimisations we might apply
	export let svg = 'svg';
	export let path = 'path';
</script>

<svelte:element this={svg}>
	<svelte:element this={path}></svelte:element>
</svelte:element>
