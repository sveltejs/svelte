<script>
	class Counter {
		#count = $state(0);

		constructor() {
			$effect(() => {
				this.#count = 10;
			});
		}

		getCount() {
			return this.#count;
		}

		increment() {
			this.#count++;
		}
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.increment()}>{counter.getCount()}</button>
