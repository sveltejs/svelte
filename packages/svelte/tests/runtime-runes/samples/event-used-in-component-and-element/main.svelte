<script>
	import Sub from './sub.svelte';

	let count = $state(0)

	function increment() {
		count += 1
	}
</script>

<button on:click={increment}>Count: {count}</button>
<Sub onClick={increment}/>
