<script>
	let count = $state(0);
	let runs = 0;

	function delay(value, eager_value) {
		if (runs++ > 10) throw new Error('infinite loop detected')
		if (value === 0) return 0;
		return Promise.resolve(value + eager_value);
	}
</script>

<button onclick={() => count += 1}>increment</button>

<p>{await delay(count, $state.eager(count))}</p>
