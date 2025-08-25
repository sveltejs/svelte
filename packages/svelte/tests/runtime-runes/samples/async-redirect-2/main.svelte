<script lang=ts>
	let route = $state('a');

	function goto(r) {
		return Promise.resolve().then(async () => {
			route = r;
			await Promise.resolve();
		});
	}

	$effect(() => {
		console.log('route ' + route);
	});
</script>

<h1>{route}</h1>
<button onclick={() => route = 'a'}>a</button>
<button onclick={() => route = 'b'}>b</button>
<button onclick={() => route = 'c'}>c</button>

<svelte:boundary>
	{#if route === 'a'}
		<p>a</p>
	{/if}

	{#if route === 'b'} 
		{await goto('c')}
	{/if}

	{#if route === 'c'}
		<p>c</p>
	{/if}

	{#if route === 'b' || route === 'c'}
		<p>b or c</p>
	{/if}

	{#snippet pending()}
		<p>pending...</p>
	{/snippet}
</svelte:boundary>
