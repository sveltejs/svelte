{#each things as thing}
	<span>{thing.name}</span>
	{@debug foo, bar, baz, thing}
{/each}

<p>foo: {foo}</p>