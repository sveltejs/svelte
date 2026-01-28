<script>
	const counter = new class Counter {
		constructor() {
			this.count = $state(0);
			$effect(() => {
				this.count = 10;
			});
		}
	}
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
