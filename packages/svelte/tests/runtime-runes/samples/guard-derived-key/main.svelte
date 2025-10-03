<script>
	let item = $state({ nested: { value: 1 } });
	let toggle = $state(false);

	$effect(() => {
		if (toggle) item = null;
	});
</script>

{#key item?.nested?.value}
	{#if item?.nested?.value > 0}
		positive
	{:else}
		zero
	{/if}
{/key}

<button onclick={() => (toggle = true)}>toggle</button>
