<script>
	let { tag, children } = $props();
</script>

<svelte:element this={tag}>
	{@render children?.()}
</svelte:element>
