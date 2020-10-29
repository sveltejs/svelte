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

	<meta name="twitter:title" content={post.metadata.title}>
	<meta name="twitter:description" content={post.metadata.description}>
	<meta name="Description" content={post.metadata.description}>
</svelte:head>

<article class='post listify'>
	<h1>{post.metadata.title}</h1>
	<p class='standfirst'>{post.metadata.description}</p>

	<p class='byline'><a href='{post.metadata.authorURL}'>{post.metadata.author}</a> <time datetime='{post.metadata.pubdate}'>{post.metadata.dateString}</time></p>

	{@html post.html}
</article>

<style>
	.post {
		padding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);
		max-width: var(--main-width);
		margin: 0 auto;
	}

	h1 {
		font-size: 4rem;
		font-weight: 400;
	}

	.standfirst {
		font-size: var(--h4);
		color: var(--second);
		margin: 0 0 1em 0;
	}

	.byline {
		margin: 0 0 6rem 0;
		padding: 1.6rem 0 0 0;
		border-top: var(--border-w) solid #6767785b;
		font-size: var(--h6);
		text-transform: uppercase;
	}

	.byline a {
		/* border-bottom: none; */
		/* font-weight: 600; */
	}

	.byline a:hover {
		/* border-bottom: 2px solid var(--prime); */
	}

	.post h1 {
		color: var(--second);
		max-width: 20em;
		margin: 0 0 .8rem 0;
	}

	.post :global(h2) {
		margin: 2em 0 0.5em 0;
		/* color: var(--second); */
		color: var(--text);
		font-size: var(--h3);
		font-weight: 300;
	}

	.post :global(figure) {
		margin: 1.6rem 0 3.2rem 0;
	}

	.post :global(figure) :global(img) {
		max-width: 100%;
	}

	.post :global(figcaption) {
		color: var(--second);
		text-align: left;
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
		background: var(--back-api);
	}

	.post :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.post :global(aside) {
		float: right;
		margin: 0 0 1em 1em;
		width: 16rem;
		color: var(--second);
		z-index: 2;
	}

	.post :global(.max) {
		width: 100%;
	}

	.post :global(iframe) {
		width: 100%;
		height: 420px;
		margin: 2em 0;
		border-radius: var(--border-r);
		border: 0.8rem solid var(--second);
	}

	.post :global(.anchor) {
		top: calc((var(--h3) - 24px) / 2);
	}

	.post :global(a) {
		padding: 0;
		transition: none;
	}

	.post :global(a):not(:hover) {
		border: none;
	}

	@media (max-width: 768px) {
		.post :global(.anchor) {
			transform: scale(0.6);
			opacity: 1;
			left: -1.0em;
		}
	}

	@media (min-width: 910px) {
		.post :global(.max) {
			width: calc(100vw - 2 * var(--side-nav));
			margin: 0 calc(var(--main-width) / 2 - 50vw);
			text-align: center;
		}

		.post :global(.max) > :global(*) {
			width: 100%;
			max-width: 1200px;
		}

		.post :global(iframe) {
			width: 100%;
			max-width: 1100px;
			margin: 2em auto;
		}
	}

	/* @media (min-width: 1460px) {
		.post :global(iframe) {
			width: 1360px;
			margin: 2em -280px;
		}
	}

	@media (min-height: 800px) {
		.post :global(iframe) {
			height: 640px;
		}
	} */
</style>
