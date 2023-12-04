<script>
	class Counter {
		count = $state(0);
		#count;
		#_count;

		constructor(initial_count) {
			this.count = initial_count;
			this.#count = 100;
			this.#_count = 100;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
