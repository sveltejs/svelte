<script>
	import { log } from './log.js';

	class Counter {
		count = $state.frozen({ a: 0 });
	}
	const counter = new Counter();
</script>

<button on:click={() => {
	try {
		counter.count.a++
	} catch (e) {
		log.push('read only')
	}
}}>{counter.count.a}</button>
