<script>
	class Counter {
		count = $state(0);
		doubled = $derived.call(() => this.count * 2);
	}

	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<p>doubled: {counter.doubled}</p>
