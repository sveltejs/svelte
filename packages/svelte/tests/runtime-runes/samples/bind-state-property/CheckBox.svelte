<script>
	let { checked, ...rest } = $props.bindable();
</script>

<input type="checkbox" bind:checked {...rest} />
