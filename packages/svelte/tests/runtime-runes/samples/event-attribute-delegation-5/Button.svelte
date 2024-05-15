<script>
	const { children, ...props } = $props();
</script>

<button {...props} on:click>
	{@render children()}
</button>
