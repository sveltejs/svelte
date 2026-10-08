<script>
	import { flushSync } from 'svelte';

	let items = $state([1]);
	let other = $state(0);
	let go = $state(false);

	$effect(() => {
		other;
	});

	// this effect never reads `items`
	$effect(() => {
		console.log('effect');

		if (go) {
			other = 1;

			flushSync(() => {
				items = [1, 2];
			});
		}
	});
</script>

<button onclick={() => (go = true)}>go</button>
<button onclick={() => items.push(items.length + 1)}>add</button>

{#each items as item}
	<p>{item}</p>
{/each}
