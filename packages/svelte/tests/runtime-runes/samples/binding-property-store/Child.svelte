<script>
	let { count = $bindable() } = $props();
</script>

<input type="number" bind:value={count} />
