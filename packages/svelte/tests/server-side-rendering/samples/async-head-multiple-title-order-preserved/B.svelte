<script>
	let { promise } = $props();
</script>

<svelte:head>
		<title>{(await promise) && 'B'}</title>
</svelte:head>
