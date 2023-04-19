<script>
	let current = 'foo';
</script>

<button
	class="{current === 'foo' ? 'selected' : ''}"
	on:click="{() => current = 'foo'}"
>foo</button>

<button
	class="{current === 'bar' ? 'selected' : ''}"
	on:click="{() => current = 'bar'}"
>bar</button>

<button
	class="{current === 'baz' ? 'selected' : ''}"
	on:click="{() => current = 'baz'}"
>baz</button>

<style>
	button {
		display: block;
	}

	.selected {
		background-color: #ff3e00;
		color: white;
	}
</style>