<script>
	let browser = typeof window !== 'undefined';

	let a = Promise.withResolvers();
	let b = Promise.withResolvers();

	if (!browser) {
		a.resolve(true);
		b.resolve(true);
	}
</script>

<button onclick={() => a.resolve(true)}>
	resolve a
</button>

<button onclick={() => b.resolve(true)}>
	resolve b
</button>

<svelte:boundary>
	{#if await a.promise}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}

	<p>hello from {browser ? 'browser' : 'server'}</p>
</svelte:boundary>

<svelte:boundary>
	{#if await b.promise}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}

	<p>hello from {browser ? 'browser' : 'server'}</p>
</svelte:boundary>
