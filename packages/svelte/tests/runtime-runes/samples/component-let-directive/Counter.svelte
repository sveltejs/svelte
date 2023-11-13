<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button on:click={increment}>
	<slot {count} />
</button>

<slot name="named" />
