<script>
	let { item } = $props();
</script>

<!-- svelte-ignore ownership_invalid_mutation -->
<input bind:value={item.heading} />
