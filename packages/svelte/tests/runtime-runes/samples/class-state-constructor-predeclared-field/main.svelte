<script>
	class Counter {
		count;

		constructor(count) {
			this.count = $state(count);
		}
	}
	const counter = new Counter(0);
</script>

<button onclick={() => counter.count++}>{counter.count}</button>
