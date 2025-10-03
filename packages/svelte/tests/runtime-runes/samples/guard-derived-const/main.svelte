<script>
	let items = $state([
		{ nested: { value: 1 } },
		{ nested: { value: 2 } }
	]);
	let show = $state(true);

	let first = $derived(items[0]);

	$effect(() => {
		if (!show) {
			items = [];
		}
	});
</script>

{#if first?.nested?.value > 1}
	big
{:else}
	small
{/if}

<button onclick={() => (show = false)}>toggle</button>
