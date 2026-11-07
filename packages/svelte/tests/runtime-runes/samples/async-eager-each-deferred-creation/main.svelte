<script>
	import Child from './Child.svelte';

	let go = $state(false);
	let keep = $state(false);
	let items = $state([]);

	$effect(() => {
		if (go) items = [1];
	});

	$effect(() => {
		if (go) items = [];
	});

	$effect(() => {
		if (keep) items = [3];
	});
</script>

<button onclick={() => (go = true)}>go</button>
<button onclick={() => (keep = true)}>keep</button>
<button onclick={() => (items = [2])}>set</button>

{#each items as item}
	<Child />
{/each}
