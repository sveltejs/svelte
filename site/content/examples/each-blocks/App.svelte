<h1>Cats of YouTube</h1>

<ul>
	{#each cats as cat}
		<li><a target="_blank" href={cat.video}>{cat.name}</a></li>
	{/each}
</ul>