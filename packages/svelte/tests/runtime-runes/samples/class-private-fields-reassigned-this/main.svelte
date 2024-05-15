<script>
	class Counter {
		#count = $state();

		constructor(){
			const instance = this;
			instance.#count = 1;
		}

		get count(){
			return this.#count;
		}

		get count2() {
			const instance = this;
			return instance.#count;
		}
	}
	const counter = new Counter();

	$inspect(counter.count)
	$inspect(counter.count2)
</script>
