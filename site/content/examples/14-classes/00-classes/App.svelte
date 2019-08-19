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
	class:active="{current === 'foo'}"
	on:click="{() => current = 'foo'}"
>foo</button>

<button
	class:active="{current === 'bar'}"
	on:click="{() => current = 'bar'}"
>bar</button>

<button
	class:active="{current === 'baz'}"
	on:click="{() => current = 'baz'}"
>baz</button>