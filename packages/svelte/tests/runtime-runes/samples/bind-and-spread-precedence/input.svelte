<script>
	let { value = $bindable(), ...properties } = $props();
</script>

<input bind:value {...properties} />
