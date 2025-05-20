<script>
	class Counter {
		constructor() {
			this.count = $state(0);
			$effect(() => {
				this.count = 10;
			});
		}
	}
	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
