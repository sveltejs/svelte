<script lang=ts>
	let route = $state('b');
	let ok = $state(false);

	function goto(r) {
		return Promise.resolve().then(() => {
			route = r;
			throw new Error('nope');
		});
	}
</script>

<h1>{route}</h1>
<button onclick={() => route = 'a'}>a</button>
<button onclick={() => route = 'b'}>b</button>
<button onclick={() => route = 'c'}>c</button>
<button onclick={() => ok = true}>ok</button>

<svelte:boundary>
	{#if route === 'a'}
		<p>a</p>
	{/if}

	{#if route === 'b'}
		{#if ok}
			<p>b</p>
		{:else}
			{await goto('c')}
		{/if}
	{/if}

	{#if route === 'c'}
		<p>c</p>
	{/if}

	{#snippet pending()}
		<p>pending...</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<button onclick={reset}>retry</button>
	{/snippet}
</svelte:boundary>
