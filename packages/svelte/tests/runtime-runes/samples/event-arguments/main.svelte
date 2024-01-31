<script>
	let count = $state(0);
	function increment() {
			count += arguments.length;
	}
</script>

<button on:click={increment}>{count}</button>
