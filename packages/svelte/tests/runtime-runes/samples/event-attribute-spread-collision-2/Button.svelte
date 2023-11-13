<script>
	const {log, ...restProps} = $props();
</script>

<button onclick={() => log.push('internal!')} {...restProps}>
	<slot />
</button>
