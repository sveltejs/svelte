<script>
	const { children, ...props } = $props();
</script>

<div {...props} on:click>
	{@render children()}
</div>
