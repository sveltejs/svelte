<script>
	class Counter {
		#count;
		get secretCount() {
			return this.#count;
		}

		constructor() {
			this.#count = $state(0); // TODO
			this.count = $state(0);
			this.double = $derived(this.count * 2);
		}

		increment() {
			this.#count++;
			this.count++;
		}
	}

	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<button on:click={counter.increment}>{counter.secretCount}</button>
