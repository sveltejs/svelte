<script>
	let props = $props();
</script>

<option {...props}>{@render props.children?.()}</option>