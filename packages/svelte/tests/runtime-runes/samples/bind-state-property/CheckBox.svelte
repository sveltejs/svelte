<script>
	let { checked: _, ...rest } = $props();
	let { checked } = $props.bindable();
</script>

<input type="checkbox" bind:checked {...rest} />
