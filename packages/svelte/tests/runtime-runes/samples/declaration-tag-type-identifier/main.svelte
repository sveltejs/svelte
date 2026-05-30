<script>
	const assetTypes = ['a', 'b', 'all'];
</script>

<ul>
	{#each assetTypes as type (type)}
		<li>{type === 'all' ? 'All types' : type}</li>
	{/each}
</ul>
