<script>
	class Counter {
		count = $state.readonly(0);
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
