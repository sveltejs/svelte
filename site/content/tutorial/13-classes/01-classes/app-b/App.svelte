<script>
	let current = 'foo';
</script>

<style>
	button {
		display: block;
	}

	.selected {
		background-color: #ff3e00;
		color: white;
	}
</style>

<button
	class:selected="{current === 'foo'}"
	on:click="{() => current = 'foo'}"
>foo</button>

<button
	class:selected="{current === 'bar'}"
	on:click="{() => current = 'bar'}"
>bar</button>

<button
	class:selected="{current === 'baz'}"
	on:click="{() => current = 'baz'}"
>baz</button>