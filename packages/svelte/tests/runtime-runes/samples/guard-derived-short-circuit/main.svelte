<script>
	let virtualItems = $state([{ index: 0 }, { index: 1 }, { index: 2 }]);
	let centerRows = $state([{ depth: 2 }, { depth: 1 }, { depth: 1 }]);

	let someChange = $state(false);
	$effect(() => {
		if (someChange) centerRows = [];
	});
</script>

{#each virtualItems as row (row.index)}
	{@const centerRow = centerRows[row.index]}
	{#if centerRow != undefined && centerRow.depth != undefined && typeof centerRow === "object" && "depth" in centerRow && typeof centerRow.depth === "number"}
		{#if centerRow.depth != undefined && centerRow.depth > 0}
			Hello World<br />
		{/if}
	{/if}
{/each}

<button onclick={() => (someChange = true)}>Trigger</button>