<script>
	class Counter {
		#count = $state.frozen(0);

		constructor(initial_count) {
			this.#count = initial_count;
		}

		get count() {
			return this.#count;
		}
		set count(val) {
			this.#count = val;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
