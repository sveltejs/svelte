<script>
	const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
</script>

<svg
	width="24" height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor" stroke-width="2">
	{#each iconNode as [tag, attrs]}
		<svelte:element this={tag} {...attrs}/>
	{/each}
</svg>
