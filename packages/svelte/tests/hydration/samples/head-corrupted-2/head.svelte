<script>
	let { children } = $props();
</script>
<svelte:head>
	{@render children()}
</svelte:head>
