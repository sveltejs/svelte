<script>
	class Counter {
		container = $state({ count: -1 });
		#private = $state({ count: -1 });

		constructor(initial_count) {
			this.container.count = initial_count;
			this.#private.count = initial_count;
		}

		increment() {
			this.container.count += 1;
			this.#private.count += 1;
		}

		get private_count() {
			return this.#private.count;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => counter.container.count++}>{counter.container.count} / {counter.private_count}</button>
<button on:click={() => counter.increment()}>{counter.container.count} / {counter.private_count}</button>
