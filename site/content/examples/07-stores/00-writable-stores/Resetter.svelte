<script>
	import { counter } from './stores.js';

	function reset() {
		counter.set(0);
	}
</script>

<button on:click={reset}>
	reset
</button>