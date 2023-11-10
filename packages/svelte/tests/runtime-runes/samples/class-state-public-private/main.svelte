<script>
	class Counter {
		count = $state(0);

		#count = $state(0);

		increment = () => this.#count += 1;

		get secretCount() {
			return this.#count;
		}
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<button on:click={counter.increment}>{counter.secretCount}</button>
