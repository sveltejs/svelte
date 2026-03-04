<script>
	let { name, content } = $props();
</script>

<svelte:head>
	<meta name="{name}-1" content="{content}-1" />
	<meta name="{name}-2" content="{content}-2" />
</svelte:head>
