<script>
	const tag = { svg: 'svg', path: 'path' };
</script>

<svelte:element this={tag.svg} xmlns="http://www.w3.org/2000/svg">
	<svelte:element this={tag.path} xmlns="http://www.w3.org/2000/svg" />
</svelte:element>
