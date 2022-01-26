<script>
	export let tags = [
		{
			name: 'Red',
			color: '#FF0000'
		},
		{
			name: 'Green',
			color: '#00FF00'
		},
		{
			name: 'Blue',
			color: '#0000FF'
		}
	];
</script>

{#each tags as tag}
	{@const tagColor = tags.find(t => t.name === tag.name).color}
	<p>{tagColor}</p>
{/each}
