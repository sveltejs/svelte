<script>
	import { counter } from './stores.js';

	function increment() {
		counter.update(n => n + 1);
	}
</script>

<button on:click={increment}>
	+
</button>