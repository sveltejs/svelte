<script>
	let x = $state(0);
	let y = $state(0);
	const first = Promise.withResolvers();
	const second = Promise.withResolvers();
	const blocker = Promise.withResolvers();

	function hold(value) {
		return value === 0 ? 0 : blocker.promise;
	}
</script>

<button onclick={() => { x = 1; y = 1; }}>update</button>
<button onclick={() => first.resolve(0)}>first</button>
<button onclick={() => blocker.resolve(1)}>blocker</button>
<button onclick={() => second.resolve(0)}>second</button>

<i>{x}</i><b>{await hold(y)}</b>
<svelte:boundary>
	<p>{(await first.promise) + x + (await second.promise)}</p>
	{#snippet pending()}<span>pending</span>{/snippet}
</svelte:boundary>
