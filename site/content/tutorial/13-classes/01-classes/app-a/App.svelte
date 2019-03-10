<script>
	let current = 'foo';
</script>

<style>
	button {
		display: block;
	}

	.active {
		background-color: #ff3e00;
		color: white;
	}
</style>

<button
	class="{current === 'foo' ? 'active' : ''}"
	on:click="{() => current = 'foo'}"
>foo</button>

<button
	class="{current === 'bar' ? 'active' : ''}"
	on:click="{() => current = 'bar'}"
>bar</button>

<button
	class="{current === 'baz' ? 'active' : ''}"
	on:click="{() => current = 'baz'}"
>baz</button>