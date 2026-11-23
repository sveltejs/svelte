<script>
	import Item from './Item.svelte';

	let a = $state(0);
	let b = $state(0);
	let list = $state([1, 2, 3]);
	// written by every update, so that the batches intersect: a later batch sees the writes of
	// an earlier one, and is merged into it if it finishes first
	let updates = $state(0);

	const queue = [];

	function push(label, v) {
		if (!v) return v;
		console.log(`${label} ${v}`);
		return new Promise((resolve) => queue.push(() => resolve(v)));
	}

	function check(v) {
		if (v === 3) throw new Error('boom');
		return true;
	}
</script>

<button onclick={() => (a++, updates++)}>a</button>
<button onclick={() => (b++, updates++)}>b</button>
<button onclick={() => (list.push(list.length + 1), updates++)}>push</button>
<button onclick={() => (list = [])}>clear</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<!-- no failed snippet/onerror: errors are not handled by the boundary -->
<svelte:boundary>
	{#if check(await push('a+b', a + b))}
		<p>{updates}: {a} + {b} = {a + b} | {await push('b', b)}</p>
	{/if}

	{#each list as item (item)}
		<Item {item} />
	{/each}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
