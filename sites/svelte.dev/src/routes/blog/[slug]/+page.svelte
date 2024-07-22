<script>
	import { page } from '$app/stores';
	import { copy_code_descendants } from '@sveltejs/site-kit/actions';
	import { DocsOnThisPage, setupDocsHovers } from '@sveltejs/site-kit/docs';

	export let data;

	setupDocsHovers();
</script>

<svelte:head>
	<title>{data.post.title}</title>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.description} />
	<meta name="description" content={data.post.description} />

	<meta name="twitter:image" content="https://svelte.dev/blog/{$page.params.slug}/card.png" />
	<meta name="og:image" content="https://svelte.dev/blog/{$page.params.slug}/card.png" />
</svelte:head>

<div class="content">
	<article class="post listify text" use:copy_code_descendants>
		<h1>{data.post.title}</h1>
		<p class="standfirst">{data.post.description}</p>

		<p class="byline">
			<a href={data.post.author.url}>{data.post.author.name}</a>
			<time datetime={data.post.date}>{data.post.date_formatted}</time>
		</p>

		<DocsOnThisPage
			details={{
				content: '',
				file: '',
				path: `/blog/${data.post.slug}`,
				sections: data.post.sections,
				slug: data.post.slug,
				title: data.post.title
			}}
			orientation="inline"
		/>

		{@html data.post.content}
	</article>
</div>

<!-- the crawler doesn't understand twitter:image etc, so we have to add this hack. TODO fix in sveltekit -->
<img hidden src="/blog/{$page.params.slug}/card.png" alt="Social card for {data.post.title}" />

<style>
	.post {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-main-width);
		margin: 0 auto;
	}

	h1 {
		font-size: 4rem;
		font-weight: 400;
	}

	.standfirst {
		font-size: var(--sk-text-s);
		color: var(--sk-text-3);
		margin: 0 0 1em 0;
	}

	.byline {
		margin: 0 0 1rem 0;
		padding: 1.6rem 0 0 0;
		border-top: var(--sk-thick-border-width) solid #6767785b;
		font-size: var(--sk-text-xs);
		text-transform: uppercase;
	}

	.post :global(figure) {
		margin: 1.6rem 0 3.2rem 0;
	}

	.post :global(figure) :global(img) {
		max-width: 100%;
	}

	.post :global(figcaption) {
		color: var(--sk-theme-2);
		text-align: left;
	}

	.post :global(video) {
		width: 100%;
	}

	.post :global(aside) {
		float: right;
		margin: 0 0 1em 1em;
		width: 16rem;
		color: var(--sk-theme-2);
		z-index: 2;
	}

	.post :global(.max) {
		width: 100%;
	}

	.post :global(iframe) {
		width: 100%;
		height: 420px;
		margin: 2em 0;
		border-radius: var(--sk-border-radius);
		border: 0.8rem solid var(--sk-theme-2);
	}

	@media (min-width: 910px) {
		.post :global(.max) {
			width: calc(100vw - 2 * var(--sk-page-padding-side));
			margin: 0 calc(var(--sk-page-main-width) / 2 - 50vw);
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
</style>
