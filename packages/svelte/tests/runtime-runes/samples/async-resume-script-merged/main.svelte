<script>
	import Child from './Child.svelte';

	let show = $state(false);
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

<button onclick={() => { x = 1; y = 1; }}>a</button>
<button onclick={() => { x = 2; show = true; }}>b</button>
<button onclick={() => resolve('y 1')}>y 1</button>
<button onclick={() => resolve('v 2')}>v 2</button>

{#if y}
	<p>{await push('y', y)}</p>
{/if}

{#if show}
	<svelte:boundary>
		<Child {x} {push} />

		{#snippet pending()}
			<p>pending</p>
		{/snippet}
	</svelte:boundary>
{/if}
