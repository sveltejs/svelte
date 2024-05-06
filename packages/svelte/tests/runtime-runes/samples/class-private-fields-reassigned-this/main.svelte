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
	}
	const counter = new Counter();

	$inspect(counter.count)
</script>
