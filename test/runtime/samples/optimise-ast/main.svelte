<script>
	let count = 0;
	function increment() {
		count = count + 1;
	}
</script>
<button on:click={increment}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button>