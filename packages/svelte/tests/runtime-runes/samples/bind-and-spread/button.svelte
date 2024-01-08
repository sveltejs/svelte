<script>
	let { value, ...props } = $props();
	
</script>

<button {...props} onclick={() => value++}>{value}</button>
