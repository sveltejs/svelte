<script>
	let { ...props } = $props();
</script>

<button {...props}>
	<slot />
</button>
