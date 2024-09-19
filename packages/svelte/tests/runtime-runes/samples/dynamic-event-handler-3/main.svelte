<script>
	import Button from './Button.svelte';

	let count = $state(0);
	let d = $state(1);

	function create_handler() {
		const change = d;

		console.log(`creating handler (${change})`);

		return function increment() {
			count += change;
			console.log(count);
		};
	}
</script>

<button on:click={() => (d += 1)}>increase d ({d})</button>

<button on:click={create_handler()}>
	clicks: {count}
</button>

<Button on:click={create_handler()}>
	clicks: {count}
</Button>
