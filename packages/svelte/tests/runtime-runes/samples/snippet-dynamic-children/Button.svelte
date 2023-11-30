<script>
	const { children, change } = $props();
</script>

<button onclick={change}>
	{@render children()}
</button>
