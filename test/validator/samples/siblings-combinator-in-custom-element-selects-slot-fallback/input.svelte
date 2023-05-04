<svelte:options customElement="custom-element" />

<h1>test</h1>
<slot>
  <span>Hello</span>
</slot>

<style>
	/* This will not be picked up */
	h1 + slot > span {
		color: red;
	}

	/* This will be picked up */
	h1 + span {
		color: red;
	}
</style>
