<script>
	class Counter {
		#count = $state(0);

		get count() {
			return this.#count;
		}
		set count(val) {
			this.#count = val;
		}
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
