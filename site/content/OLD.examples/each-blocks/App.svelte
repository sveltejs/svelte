<script>
	const cats = [
		{
			name: 'Keyboard Cat',
			video: 'https://www.youtube.com/watch?v=J---aiyznGQ'
		},
		{
			name: 'Maru',
			video: 'https://www.youtube.com/watch?v=z_AbfPXTKms'
		},
		{
			name: 'Henri The Existential Cat',
			video: 'https://www.youtube.com/watch?v=OUtn3pvWmpg'
		}
	];
</script>

<h1>Cats of YouTube</h1>

<ul>
	{#each cats as cat}
		<li><a target="_blank" href={cat.video}>{cat.name}</a></li>
	{/each}
</ul>