<script>
	import { log } from './log.js';

	class Counter {
		count = $state();
		#count;

		constructor(initial_count) {
			log.push(this.count)
			this.count = initial_count;
		}
	}
	const counter = new Counter(0);
</script>

<button on:click={() => counter.count++}>{counter.count}</button>
