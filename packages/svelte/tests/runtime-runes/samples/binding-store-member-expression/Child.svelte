<script>
	let { contactInfo = $bindable() } = $props();
</script>

<input bind:value={contactInfo.phone.value} />
