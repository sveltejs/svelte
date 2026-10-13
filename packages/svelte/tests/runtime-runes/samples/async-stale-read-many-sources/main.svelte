<script>
	let show = $state(false);
	let items = $state(Array.from({ length: 2000 }, (_, i) => i));

	const deferred = [];

	function delay(v) {
		if (!v) return v;
		return new Promise((resolve) => deferred.push(() => resolve(v)));
	}
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => items.forEach((_, i) => items[i]++)}>items</button>
<button onclick={() => deferred.shift()?.()}>shift</button>

<p>{await delay(items[0])}</p>

{#if await delay(show)}
	<div>
		{#each items as item}{item},{/each}
	</div>
{/if}
