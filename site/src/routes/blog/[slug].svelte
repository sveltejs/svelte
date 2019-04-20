<script context="module">
	export async function preload({ params }) {
		const res = await this.fetch(`blog/${params.slug}.json`);
		return res.ok ? { post: await res.json() } : this.error(404, 'Not found');
	}
</script>

<script>
	export let post;
</script>

<svelte:head>
	<title>{post.metadata.title}</title>
</svelte:head>

<article class='post linkify listify'>
	<p class='byline'><a href='{post.metadata.authorURL}'>{post.metadata.author}</a> <time datetime='{post.metadata.pubdate}'>{post.metadata.dateString}</time></p>

	<h1>{post.metadata.title}</h1>
	<p class='standfirst'>{post.metadata.description}</p>

	{@html post.html}
</article>

<style>
	.post {
		padding: var(--top-offset) var(--side-nav) 0 var(--side-nav);
		max-width: var(--main-width);
		margin: 0 auto;
	}

	.byline {
		font-size: 0.8em;
		border-bottom: 1px solid #eee;
		padding: 0;
	}

	.post h1 {
		color: var(--second);
		max-width: 20em;
		margin: 0 0 1.2rem 0;
	}

	.post :global(h2) {
		margin: 2em 0 0.5em 0;
		color: var(--second);
	}

	/* .post p,
	.post :global(p) {
		max-width: var(--linemax)
	} */

	.post :global(figure) {
		margin: 1.6rem 0 3.2rem 0;
	}

	.post :global(figure) :global(img) {
		max-width: 100%;
	}

	.post :global(figcaption) {
		color: var(--second)
	}

	.post :global(video) {
		width: 100%;
	}

	.post :global(blockquote) {
		max-width: none;
		border-left: 4px solid #eee;
		background: #f9f9f9;
		border-radius: 0 var(--border-r) var(--border-r) 0;
	}

	.post :global(code) {
		padding: .3rem .8rem .3rem;
		margin: 0 0.2rem;
		top: -.1rem;
		background: #f4f4f4;
	}

	.post :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.standfirst {
		font-size: var(--h4);
		color: var(--second);
		margin: 0 0 2em 0;
	}

	.post :global(aside) {
		float: right;
		margin: 0 0 1em 1em;
		width: 16rem;
		color: var(--second);
		z-index: 2;
	}

	.post :global(iframe) {
		width: 100%;
		height: 420px;
		margin: 2em 0;
		border-radius: var(--border-r);
		border: 0.8rem solid var(--second);
	}

	@media (min-width: 910px) {
		.post :global(iframe) {
			width: calc(100vw - 2 * var(--side-nav));
			margin: 2em calc(400px + var(--side-nav) - 50vw);
		}
	}

	@media (min-width: 1460px) {
		.post :global(iframe) {
			width: 1360px;
			margin: 2em -280px;
		}
	}

	@media (min-height: 800px) {
		.post :global(iframe) {
			height: 640px;
		}
	}
</style>