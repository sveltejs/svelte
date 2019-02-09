{#each items as item}
	<button on:click='{() => selected = item}'>{item}</button>
{/each}

<p>selected: {selected}</p>