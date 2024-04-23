<script>
	const logger = (obj) => {
		console.log(obj.count)
	}

	class Counter {
		count = $state();
		#count;

		constructor(initial_count) {
			logger(this);
			this.count = initial_count;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
