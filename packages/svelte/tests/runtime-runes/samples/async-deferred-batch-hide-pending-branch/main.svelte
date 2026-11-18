<script>
	import Effect from './Effect.svelte';

	let show = $state(true);
	let other = $state(0);

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push({ v, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(v) {
		const i = queue.findIndex((e) => e.v === v);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}
</script>

<button onclick={() => { show = false; other = 1; }}>hide</button>
<button onclick={() => resolve(0)}>other 0</button>
<button onclick={() => resolve(1)}>other 1</button>
<button onclick={() => resolve('slow')}>slow</button>

<p>{await (other === 0 ? 0 : push(other))}</p>

<svelte:boundary>
	<Effect />

	{#if show}
		<p>{await push('slow')}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
