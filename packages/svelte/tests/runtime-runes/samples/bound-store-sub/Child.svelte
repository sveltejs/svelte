<script>
	let { form = $bindable() } = $props();
</script>

<p>
	<input type="number" bind:value={form.count} />
</p>
