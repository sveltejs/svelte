<script>
	let count = $state(0);
	function increment(...args) {
			count += args.length;
	}
</script>

<button on:click={increment}>{count}</button>
