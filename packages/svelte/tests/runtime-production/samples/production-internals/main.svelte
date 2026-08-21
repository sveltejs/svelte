<script>
	import Child from "./Child.svelte";

	let foo;

	function onerror(err) {
		// re-throw if it isn't the production error
		// do in a such way because config.error is checked via `includes`
		if (err.message !== 'https://svelte.dev/e/props_invalid_value') {
			throw err;
		}
	}
</script>

<svelte:boundary {onerror}>
	<Child bind:foo />
</svelte:boundary>


