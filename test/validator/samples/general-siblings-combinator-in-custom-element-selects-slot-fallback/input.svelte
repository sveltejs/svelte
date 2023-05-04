<svelte:options tag="my-element" />

<h1>Heading 1</h1>
<span>Span 1</span>
<span>Span 2</span>
<slot>
	<p>Paragraph 2</p>
</slot>

<style>
	/* This will not get picked up */
	h1 ~ p {
		color: red;
	}

	/* This will be picked up */
	h1 ~ slot > p {
		color: red;
	}
</style>
