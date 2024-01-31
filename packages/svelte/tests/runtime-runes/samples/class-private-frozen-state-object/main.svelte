<script>
	import { log } from './log.js';

	class Counter {
		#count = $state.frozen();

		constructor(initial_count) {
			this.#count = { a: initial_count };
		}

		get count() {
			return this.#count;
		}
		set count(val) {
			this.#count = val;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => {
	try {
		counter.count.a++
	} catch (e) {
		log.push('read only')
	}
}}>{counter.count.a}</button>
