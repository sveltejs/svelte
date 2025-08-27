<script>
	let { promise } = $props();
</script>

<svelte:head>
	{#if await promise}
		<title>A</title>
	{/if}
</svelte:head>
