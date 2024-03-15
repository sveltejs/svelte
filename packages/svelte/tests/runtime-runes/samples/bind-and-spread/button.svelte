<script>
	let { value, ...props } = $props.bindable();
</script>

<button {...props} onclick={() => value++}>{value}</button>
