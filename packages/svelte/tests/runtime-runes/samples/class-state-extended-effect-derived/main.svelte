<script>
	class Base {
		count = $state(0);
	}

	class Counter extends Base {
		constructor(initial) {
			super();
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
