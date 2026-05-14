<script>
	let counts = $state([0, 0, 0]);
	const queued = [];
	async function delay(v) {
		if (!v) return v;
		return new Promise(r => queued.push(() => r(v)));
	}
</script>

<button onclick={() => counts[1]++}>increment</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<ul>
	{#each counts as count, i}
		<li>
			{await delay(count)} /
			{#if console.log(i) || $state.eager(count) !== count}
				loading...
			{:else}
				{count}
			{/if}
		</li>
	{/each}
</ul>
