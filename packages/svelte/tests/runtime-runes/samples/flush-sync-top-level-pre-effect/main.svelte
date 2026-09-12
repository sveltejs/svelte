<script>
	import { flushSync } from 'svelte';

	let count = $state(0);

	$effect.pre(() => {
		console.log('pre ran');
	});

	flushSync();
</script>

<button onclick={() => count++}>{count}</button>
