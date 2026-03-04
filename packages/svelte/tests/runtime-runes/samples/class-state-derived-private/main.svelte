<script>
	class Counter {
		count = $state(0);
		#doubled = $derived(this.count * 2);
		#tripled = $derived.by(() => this.count * this.by);

		constructor(by) {
			this.by = by;
		}

		get embiggened1() {
			const self = this;
			return self.#doubled;
		}

		get embiggened2() {
			return this.#tripled;
		}
	}

	const counter = new Counter(3);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
<p>doubled: {counter.embiggened1}</p>
<p>tripled: {counter.embiggened2}</p>
