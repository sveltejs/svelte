<script>
	class Counter {
		/** @type {number} */
		#count;

		constructor(initial) {
			this.#count = $state(initial);
			this.doubled = $derived(this.#count * 2);
		}

		increment = () => {
			this.#count++;
		}
	}
	const counter = new Counter(10);
</script>

<button onclick={counter.increment}>{counter.doubled}</button>
