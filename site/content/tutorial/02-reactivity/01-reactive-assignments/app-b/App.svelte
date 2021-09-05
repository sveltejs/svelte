<script>
	let count = 0;
	const incrementCount = () => count++;
</script>

<button on:click={incrementCount}>
	Clicked {count} time{count !== 1 ? 's' : ''}
</button>
