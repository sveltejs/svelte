<script>
	class Counter {
		#count = $state(1);

		double() {
			this.#count *= 2;
		}

		getCount() {
			return this.#count;
		}
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.double()}>{counter.getCount()}</button>
