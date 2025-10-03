<script>
	let virtualItems = $state([{ index: 0 }, { index: 1 }, { index: 2 }]);
	let centerRows = $state([
		{ nested: { optional: 2, required: 3 } },
		{ nested: { required: 4 } },
		{ nested: { required: 5 } }
	]);

	let someChange = $state(false);
	$effect(() => {
		if (someChange) centerRows = [];
	});
</script>

{#each virtualItems as row (row.index)}
	{@const centerRow = centerRows[row.index]}
	{#if centerRow?.nested != undefined}
		{#if centerRow?.nested?.optional != undefined && centerRow.nested.optional > 0}
			op: {centerRow.nested.optional}<br />
		{:else}
			req: {centerRow.nested.required}<br />
		{/if}
	{/if}
{/each}

<button onclick={() => (someChange = true)}>Trigger</button>
