{#each items as item}
	<button on:click='{() => foo = bar}'>{item}</button>
{/each}

<p>foo: {foo}</p>