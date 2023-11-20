<script>
	let { checked, ...rest } = $props();
</script>

<input type="checkbox" bind:checked {...rest} />
