<script>
	let centerRow = $state({ nested: { optional: 2, required: 3 } });

	let someChange = $state(false);
	$effect(() => {
		if (someChange) centerRow = undefined;
	});
</script>

{#if centerRow?.nested}
	{#if centerRow?.nested?.optional != undefined && centerRow.nested.optional > 0}
		op: {centerRow.nested.optional}<br />
	{:else}
		req: {centerRow.nested.required}<br />
	{/if}
{/if}

<button onclick={() => (someChange = true)}>Trigger</button>
