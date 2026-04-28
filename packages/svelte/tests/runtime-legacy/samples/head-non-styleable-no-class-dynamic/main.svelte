<script>
	let author = 'Re:Designed';
	let author_url = 'https://example.com/re-designed';

	function toggle() {
		author = author === 'Re:Designed' ? 'Anonymous' : 'Re:Designed';
		author_url =
			author_url === 'https://example.com/re-designed'
				? 'https://example.com/anonymous'
				: 'https://example.com/re-designed';
	}
</script>

<svelte:head>
	<meta name="author" content={author} />
	<link rel="author" href={author_url} />
	<script type="application/ld+json"></script>
</svelte:head>

<button on:click={toggle}>toggle</button>
<div class="credits">Site by {author}</div>

<style>
	.credits {
		color: red;
	}
</style>
