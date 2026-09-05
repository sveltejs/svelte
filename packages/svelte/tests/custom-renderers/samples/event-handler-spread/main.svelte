<script>
	let count = $state(0);

	const spread = {
		onclick(...args) {
			count++;
			console.log(...args);
		}
	};
</script>

<button {...spread}>click me</button>
<p>{count}</p>
