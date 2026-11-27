<script>
	let count = $state(1);
</script>

<svelte:head><title>{doubled} doubled</title></svelte:head>

<button onclick={() => (count += 1)}>{doubled}</button>

{let doubled = $derived(count * 2)}
