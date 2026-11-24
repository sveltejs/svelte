<script>
	import { flushSync } from 'svelte';
	let go = $state(false);
	let items = $state([]);
	let done = false;

	$effect(() => {
		if (go && !done) {
			done = true;
			items = [1, 2];
			flushSync();
		}
	});
</script>

<button onclick={() => (go = true)}>go</button>
{#each items as item}<p>{item}</p>{/each}
