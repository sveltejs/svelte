<script>
	let page = $state('a');

	/** @type {Array<() => void>} */
	const a = [];
	/** @type {Array<() => void>} */
	const b = [];

	function gate(next) {
		const deferred = Promise.withResolvers();

		if (next === 'a') a.push(deferred.resolve);
		else b.push(deferred.resolve);

		return deferred.promise;
	}

	function nav(next) {
		page = next;
	}

	const to_render = $derived(page === 'a' ? snippet_a : snippet_b);
</script>

<button onclick={() => nav('a')}>a</button>
<button onclick={() => nav('b')}>b</button>
<button onclick={() => a.shift()?.()}>resolve a</button>
<button onclick={() => b.shift()?.()}>resolve b</button>
 
{#snippet snippet_a()}
	<svelte:boundary>
		{@const _a = await gate('a')}
		<p>page a</p>

		{#snippet pending()}
			<p>pending a</p>
		{/snippet}
	</svelte:boundary>
{/snippet}

{#snippet snippet_b()}
	<svelte:boundary>
		{@const _b = await gate('b')}
		<p>page b</p>

		{#snippet pending()}
			<p>pending b</p>
		{/snippet}
	</svelte:boundary>
{/snippet}

{@render to_render()} 
