<svelte:head>
	<meta name="author" content={author} />
	<link rel="author" href={author_url} />
	<script type="application/ld+json"></script>
</svelte:head>

<div class="credits">
	Site by
	<a href={author_url} target="_blank" rel="noopener noreferrer author" title={`Authored by ${author}`}>
		<nobr>{author}</nobr>
	</a>
</div>

<script>
	let { author = 'Anonymous', author_url = 'https://example.com' } = $props();
</script>

<style>
</style>
