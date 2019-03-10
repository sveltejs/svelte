<script>
	const node = {
		name: 'Fruit',
		children: [
			{
				name: 'Red',
				children: [
					{
						name: 'Cherry'
					},
					{
						name: 'Strawberry'
					}
				]
			},
			{
				name: 'Green',
				children: [
					{
						name: 'Apple'
					},
					{
						name: 'Pear'
					},
					{
						name: 'Lime'
					}
				]
			}
		]
	};
</script>

<ul>
	<li>{node.name}
		{#if node.children}
			{#each node.children as child}
				<svelte:self node={child}/>
			{/each}
		{/if}
	</li>
</ul>