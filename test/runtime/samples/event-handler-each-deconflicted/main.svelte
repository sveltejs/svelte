{#each foo as f}
	<button on:click='{() => clicked = "foo"}'>foo</button>
{/each}

{#each bar as b}
	<button on:click='{() => clicked = "bar"}'>bar</button>
{/each}

<p>clicked: {clicked}</p>