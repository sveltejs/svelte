<script>
	import Button from './Button.svelte';

	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<Button on:click={increment}>
	clicks: {count}
</Button>
