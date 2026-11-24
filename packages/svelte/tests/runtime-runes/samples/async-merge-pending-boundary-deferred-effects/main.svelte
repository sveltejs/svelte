<script>
	import Child from './Child.svelte';

	let a = $state(0);
	let x = $state(0);
	let show = $state(false);

	let queue = [];

	function push(label, v) {
		if (v === 0) return v;
		console.log(`${label} ${v}`);
		return new Promise((fulfil) => queue.push({ label, fulfil: () => fulfil(v) }));
	}

	function resolve(label, last = false) {
		const matching = queue.filter((entry) => entry.label === label);
		const entry = last ? matching.at(-1) : matching[0];
		if (!entry) return;
		queue.splice(queue.indexOf(entry), 1);
		entry.fulfil();
	}
</script>

<button onclick={() => { a++; x++; }}>a, x</button>
<button onclick={() => { a++; show = true; }}>a, show</button>
<button onclick={() => resolve('x')}>resolve x</button>
<button onclick={() => resolve('a', true)}>pop a</button>
<button onclick={() => resolve('child')}>resolve child</button>
<button onclick={() => { show = false; queue = []; }}>reset</button>

<i>{await push('x', x)}</i>
<p>{await push('a', a)}</p>

{#if show}
	<svelte:boundary>
		<Child {push} />

		{#snippet pending()}
			<p>loading</p>
		{/snippet}
	</svelte:boundary>
{/if}
