<script>
	import Item from './Item.svelte';

	let a = $state(0);
	let list = $state([1, 2, 3]);

	let queue = [];
	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}

	function check(v) {
		if (v === 1) throw new Error('boom');
		return true;
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => list.push(4)}>push</button>
<button onclick={() => (list = [])}>clear</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<!-- no failed snippet/onerror: errors are not handled by the boundary -->
<svelte:boundary>
	{#if check(await push(a))}
		<p>a: {a}</p>
	{/if}

	{#each list.slice(0, a + 10) as item (item)}
		<Item {item} />
	{/each}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
