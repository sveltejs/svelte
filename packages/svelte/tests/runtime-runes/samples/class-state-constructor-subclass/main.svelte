<script>
	class Counter {
		constructor(initial) {
			this.count = $state(initial);
		}

		increment = () => {
			this.count++;
		}
	}

	class PluggableCounter extends Counter {
		constructor(initial, plugin) {
			super(initial)
			this.custom = $derived(plugin(this.count));
		}
	}

	const counter = new PluggableCounter(10, (count) => count * 2);
</script>

<button onclick={counter.increment}>{counter.count}: {counter.custom}</button>
