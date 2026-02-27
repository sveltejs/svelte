<script>
	let { browser } = $props();

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
	{#if true}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}

	{#if await a.promise}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}
</svelte:boundary>

<svelte:boundary>
	{#if true}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}

	{#if await b.promise}
		<p>hello from {browser ? 'browser' : 'server'}</p>
	{/if}
</svelte:boundary>
