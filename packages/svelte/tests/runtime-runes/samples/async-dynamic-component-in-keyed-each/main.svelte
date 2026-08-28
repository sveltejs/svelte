<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let items = $state([{ id: 0 }, { id: 1 }, { id: 2 }]);
	let Component = $state(A);
	const queue = [];

	function gate(id) {
		if (Component === A) return id;
		const p = Promise.withResolvers();
		queue.push(() => p.resolve(id));
		return p.promise;
	}
</script>

<button onclick={() => items.reverse()}>flip</button>
<button onclick={() => (Component = B)}>swap</button>
<button onclick={() => queue.shift()?.()}>release</button>

<svelte:boundary>
	{#each items as item (item.id)}<Component id={item.id} {gate} />{/each}
	{#snippet pending()}<i>pending</i>{/snippet}
</svelte:boundary>
