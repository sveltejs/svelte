<script>
	class Counter {
		count = $state(0);
		constructor(initial) {
			$effect.pre(() => {
				console.log(this.count);
			});
			this.count = initial;
		}
	}
	const counter = $derived(new Counter(10));

	counter;
</script>

<button onclick={() => counter.count++}>{counter.count}</button>
