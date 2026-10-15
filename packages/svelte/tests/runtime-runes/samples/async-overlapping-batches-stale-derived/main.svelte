<script>
	let a = $state(0);
	let b = $state(0);
	let sum = $derived(a + b);
	const queued = [];

	$effect(() => {
		console.log(sum);
	});

	function push(tag, value) {
		return new Promise((resolve) => queued.push(() => resolve(`${tag}${value}`)));
	}
</script>

<button onclick={() => queued.shift()?.()}>resolve</button>
<button onclick={() => b = 1}>set b to 1</button>
<button onclick={() => b = 0}>set b to 0</button>

<svelte:boundary>
	<p>{await push('p', a)}|{sum}</p>
	{#if true}
		<em>{await push('key', b)}</em>
	{/if}

	{#snippet pending()}
		loading
	{/snippet}
</svelte:boundary>
