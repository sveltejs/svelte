<svelte:options customElement="my-element" />

<h1>Heading 1</h1>
<span>Span 1</span>
<span>Span 2</span>
<slot>
	<p>Paragraph 2</p>
</slot>

<style>
	/* This will not be picked up */
	h1 ~ slot > p {
		color: red;
	}

	/* This will get picked up */
	h1 ~ p {
		color: red;
	}
</style>
