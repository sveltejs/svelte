<script>
	let count = $state(0);

	const queued = [];

	async function delay(v) {
		if (!v) return v;
		return new Promise(r => queued.push(() => r(v)));
	}
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

{await delay(count)} 
{#if $state.eager(count) !== count}
	<p>loading...</p>
{:else}
	<p>{count}</p>
{/if}
