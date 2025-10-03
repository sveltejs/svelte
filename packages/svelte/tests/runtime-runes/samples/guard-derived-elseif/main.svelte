<script>
	let centerRows = $state([
		{ depth: 0, nested: { optional: 1 } },
		{ depth: 2, nested: { optional: 3 } }
	]);
	let index = $state(0);

	let centerRow = $derived(centerRows[index]);

	$effect(() => {
		if (index) {
			centerRows = [];
		}
	});
</script>

{#if centerRow?.nested?.optional > 2}
	A
{:else if centerRow?.nested?.optional > 1}
	B
{:else}
	C
{/if}

<button onclick={() => (index = 1)}>switch</button>
