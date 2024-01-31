{#each people as { name, cool = true }}
	<p>{name} is {cool ? 'cool' : 'not cool'}</p>
{/each}
