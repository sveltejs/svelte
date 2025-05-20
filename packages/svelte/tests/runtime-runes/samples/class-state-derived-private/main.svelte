<script>
	class Counter {
		count = $state(0);
		#doubled = $derived(this.count * 2);
		#trippled = $derived.by(() => this.count * this.by);

		constructor(by) {
			this.by = by;
		}

		get embiggened1() {
			return this.#doubled;
		}

		get embiggened2() {
			return this.#trippled;
		}
	}

	const counter = new Counter(3);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<p>doubled: {counter.embiggened1}</p>
<p>trippled: {counter.embiggened2}</p>
