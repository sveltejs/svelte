<script>
	let title = $state('Hello world');
	let desc = $state('Some description');
</script>
<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc}>
	<meta name="author" content="@svelteawesome">
</svelte:head>
