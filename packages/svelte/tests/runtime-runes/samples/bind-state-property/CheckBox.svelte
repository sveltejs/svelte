<script>
	let { checked = $bindable(), ...rest } = $props();
</script>

<input type="checkbox" bind:checked {...rest} />
