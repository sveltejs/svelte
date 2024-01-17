{#snippet my_snippet()}
  <span>Hello world</span>
{/snippet}

<div>{@render my_snippet()}</div>

<p>
	{#snippet my_snippet()}
		<span>Hello world</span>
	{/snippet}

	<strong>{@render my_snippet()}</strong>
</p>

<style>
	div > span {
		background-color: red;
	}

	div span {
		letter-spacing: 10px;
	}

	div :global(span) {
		text-decoration: underline;
	}

	p span {
		background: black;
	}
</style>
