<script>
	let content = "some keywords"
</script>

<svelte:head>
	<meta name="description" content="some description" />
	<meta name="keywords" {content} />
</svelte:head>

<div>Just a dummy page.</div>
