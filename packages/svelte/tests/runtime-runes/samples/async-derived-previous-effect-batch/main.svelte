<script>
	import { untrack } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let z = $state(0);
	let d = $derived(x * 2);

	const queue = [];
	function push(v) {
		return new Promise((r) => queue.push(() => r(v)));
	}

	// creates a new batch while the batch that changed `x` flushes its effects...
	$effect(() => {
		if (x) untrack(() => z++);
	});

	// ...before `d` is computed for the first time in that batch
	$effect(() => {
		console.log(y, x, d);
	});
</script>

<button onclick={() => y++}>y</button>
<button onclick={() => x++}>x</button>
<button onclick={() => queue.shift()()}>shift</button>

<p>{y ? await push(y) : y}</p>

{#if x}
	<svelte:boundary>
		<p>{await push(x)}</p>
		{#snippet pending()}
			<p>loading</p>
		{/snippet}
	</svelte:boundary>
{/if}
