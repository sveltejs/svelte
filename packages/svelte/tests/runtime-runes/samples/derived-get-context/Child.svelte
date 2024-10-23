<script>
	import { getContext } from 'svelte'

	let count = $state(0);
	let total = $derived(multiply(count));

	function multiply(num) {
		const context = getContext("key");
		return num * context;
	}
</script>

<button onclick={() => count++}>{total}</button>
