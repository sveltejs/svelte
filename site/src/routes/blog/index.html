<script context="module">
	export async function preload() {
		const posts = await this.fetch(`api/blog`).then(r => r.json());
		return { posts };
	}
</script>

<script>
	export let posts;
</script>

<svelte:head>
	<title>Svelte • The magical disappearing UI framework</title>
</svelte:head>

<div class='posts stretch'>
	{#each posts as post}
		<article class='post' data-pubdate={post.metadata.dateString}>
			<a rel='prefetch' href='blog/{post.slug}' title='Read the article »'>
				<h2>{post.metadata.title}</h2>
				<p>{post.metadata.description}</p>
			</a>
		</article>
	{/each}
</div>

<style>
	.posts {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
		min-height: calc(100vh - var(--nav-h));
		padding: var(--top-offset) 0;
		max-width: var(--main-width);
		margin: 0 auto;
	}

	h2 {
		display: inline-block;
		margin: 2rem 0 0.5rem 0;
		color: var(--second);
		/* max-width: 18em; */
		font-size: 2rem;
	}

	.post:first-child {
		margin: 0 0 2em 0;
		border-bottom: 1px solid #eee;
	}

	.post:first-child h2 {
		font-size: 4rem;
	}

	.post:first-child::before {
		content: 'Latest post • ' attr(data-pubdate);
		font-weight: 400;
		color: #aaa;
		text-transform: uppercase;
	}

	.post:nth-child(2)::before {
		content: 'Older posts';
		font-weight: 400;
		color: #aaa;
		text-transform: uppercase;
	}

	.post p {
		font-size: var(--h5);
		max-width: 30em;
		color: var(--second);
	}

	.post > a {
		display: block;
	}

	.posts a:hover,
	.posts a:hover > h2 {
		color: var(--flash)
	}
</style>