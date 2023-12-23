<script>
	class Counter {
		#count = $state();

		constructor(v) {
			this.#count = v;
		}

		get count() {
			return this.#count;
		}
	}
	const counter = new Counter({ count: 0 });
</script>

<button on:click={() => counter.count.count++}>{counter.count.count}</button>
