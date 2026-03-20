<script>
	let { tag = 'style' } = $props();
	const css = 'body { color: red; }';
</script>

<div>
	<svelte:element this={tag}>{css}</svelte:element>
</div>
