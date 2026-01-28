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
	const counter = new Counter(10);
</script>

<button onclick={() => counter.count++}>{counter.count}</button>
