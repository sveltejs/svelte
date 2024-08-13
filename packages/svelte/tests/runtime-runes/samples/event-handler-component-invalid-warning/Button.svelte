<script>
	let { children, onclick } = $props();
</script>

<button {onclick}>
	{@render children()}
</button>
