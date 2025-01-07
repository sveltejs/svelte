{#each people as { name, cool = true }}
	<p>{name} is {cool ? 'cool' : 'not cool'}</p>
{/each}

{#each people as { name = `Jane ${"Doe"}`, cool = true }}
	<p>{name} is {cool ? 'cool' : 'not cool'}</p>
{/each}

{#each people as { name = (() => { return `Jane ${"Doe"}`; })(), cool = true }}
	<p>{name} is {cool ? 'cool' : 'not cool'}</p>
{/each}
