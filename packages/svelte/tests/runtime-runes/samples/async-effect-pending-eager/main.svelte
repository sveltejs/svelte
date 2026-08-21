<script>
	let value = $state(0);
	let queued = [];

	function delayed(v) {
		if (!v) return v;
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => value++}>increment</button>
<button onclick={() => queued.shift()?.()}>shift</button>

{$state.eager(value)}

{#if 1}
	<p>pending: {$effect.pending()}</p>

	{@const tmp = await delayed(value)}
	{#if $effect.pending() > 0}
		<p>loading...</p>
	{:else}
		<p>{tmp}</p>
	{/if}
{/if}
