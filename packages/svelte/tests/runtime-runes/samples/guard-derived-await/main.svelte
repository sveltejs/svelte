<script>
	let value = $state({ nested: { depth: 2 } });
	let trigger = $state(false);

	$effect(() => {
		if (trigger) value = null;
	});

	function load() {
		return Promise.resolve(value);
	}
</script>

{#await load() then result}
	{#if result?.nested?.depth > 1}
		ok
	{:else}
		low
	{/if}
{:catch}
	error
{/await}

<button onclick={() => (trigger = true)}>trigger</button>
