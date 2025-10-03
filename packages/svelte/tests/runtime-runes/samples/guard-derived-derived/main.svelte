<script>
	let rows = $state([
		{ nested: { depth: 1 } },
		{ nested: { depth: 3 } }
	]);
	let ptr = $state(0);

	let current = $derived(rows[ptr]);
	let nested = $derived(current?.nested);

	$effect(() => {
		if (ptr === 1) {
			rows = [];
		}
	});
</script>

{#if nested?.depth > 2}
	deep
{:else}
	shallow
{/if}

<button onclick={() => (ptr = 1)}>advance</button>
