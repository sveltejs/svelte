<script>
	let items = $state([
		{ nested: { ok: true } },
		{ nested: { ok: false } }
	]);
	let clear = $state(false);

	$effect(() => {
		if (clear) items = [];
	});
</script>

{#each items as item (item.nested)}
	{#if item?.nested?.ok}
		ok
	{:else}
		fail
	{/if}
{/each}

<button onclick={() => (clear = true)}>clear</button>
