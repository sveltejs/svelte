<script>
	import { flushSync } from 'svelte';

	let go = $state(false);
	let count = $state(0);
	let span;

	$effect(() => {
		if (go) {
			flushSync(() => {
				// Create an independent batch for the nested flush to process.
				$effect.root(() => {})();
			});
		}
	});

	$effect(() => {
		if (go) {
			console.log('write');
			count = 1;
		}
	});

	$effect(() => {
		console.log(`read ${count}:${span.textContent}`);
	});

	$effect(() => {
		if (go) console.log('tail');
	});
</script>

<button onclick={() => (go = true)}>go</button>
<span bind:this={span}>{count}</span>
