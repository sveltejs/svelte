<script>
	import { flushSync } from 'svelte';

	let count = $state(0);

	flushSync();
</script>

<button onclick={() => count++}>{count}</button>
