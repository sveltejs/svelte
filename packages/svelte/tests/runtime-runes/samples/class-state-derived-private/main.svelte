<script>
	class Counter {
		count = $state(0);
		#doubled = $derived(this.count * 2);

		get embiggened() {
			return this.#doubled;
		}
	}

	const counter = new Counter();
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<p>doubled: {counter.embiggened}</p>
