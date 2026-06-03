<script>
	class Counter {
		#count;

		constructor() {
			this.#count = $state(0);
		}

		get count() {
			return this.#count;
		}

		increment = () => {
			this.#count += 1;
		}
	}

	const counter = new Counter();

	$effect(() => {
		$inspect.trace('effect');
		counter.count;
	});
</script>

<button onclick={counter.increment}>
	clicks: {counter.count}
</button>
