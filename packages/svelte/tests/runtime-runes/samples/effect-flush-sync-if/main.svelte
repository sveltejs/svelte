<script>
	import { flushSync } from 'svelte';
	let go = $state(false);
	let show = $state(false);
	let done = false;

	$effect(() => {
		if (go && !done) {
			done = true;
			show = true;
			flushSync();
		}
	});
</script>

<button onclick={() => (go = true)}>go</button>
{#if show}<p>shown</p>{/if}
