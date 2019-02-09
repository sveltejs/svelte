{#each things as thing}
	<span>{thing.name}</span>
	{@debug foo}
{/each}

<p>foo: {foo}</p>