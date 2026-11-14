<script>
	import Child from './Child.svelte';

	let x = $state(0);
	let y = $state(0);

	let queue = [];

	function push(label, v) {
		console.log(`${label} ${v}`);
		const d = Promise.withResolvers();
		queue.push({ key: `${label} ${v}`, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(key) {
		const i = queue.findIndex((e) => e.key === key);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}
</script>

<button onclick={() => { x = 1; y = 1; }}>update</button>
<button onclick={() => resolve('v 0')}>v 0</button>
<button onclick={() => resolve('v 1')}>v 1</button>
<button onclick={() => resolve('y 1')}>y 1</button>

{#if y}
	<p>{await push('y', y)}</p>
{/if}

<svelte:boundary>
	<Child {x} {push} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
