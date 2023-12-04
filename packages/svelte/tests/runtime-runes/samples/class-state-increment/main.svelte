<script>
	class Counter {
		count = $state(1);
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.count *= 2}>{counter.count}</button>
