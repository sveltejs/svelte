<script>
	import '@sveltejs/site-kit/styles/code.css';

	export let data;
</script>

<svelte:head>
	<title>FAQ • Svelte</title>

	<meta name="twitter:title" content="Svelte FAQ" />
	<meta name="twitter:description" content="Frequently asked questions about Svelte" />
	<meta name="description" content="Frequently asked questions about Svelte" />
</svelte:head>

<div class="faqs stretch">
	<h1>Frequently Asked Questions</h1>
	{#each data.faqs as faq}
		<article class="faq">
			<h2>
				<span id={faq.slug} class="offset-anchor" />
				{faq.title}
				<!-- TODO -->
				<!-- <Permalink href="/faq#{faq.slug}" /> -->
				<a href="/faq#{faq.slug}">#</a>
			</h2>
			{@html faq.content}
		</article>
	{/each}
</div>

<style>
	.faqs {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
		min-height: calc(100vh - var(--sk-nav-height));
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		/* TODO: REMOVE */
		max-width: var(--main-width);
		margin: 0 auto;
		tab-size: 2;
	}

	.faqs :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.faqs :global(pre) {
		margin: 0 0 2rem 0;
		width: 100%;
		max-width: var(--sk-line-max-width);
		padding: 1.5rem 2.5rem;
		background: #333;
		border-radius: 0.5rem;
		font-size: 0.8rem;
	}

	.faqs :global(.offset-anchor) {
		position: relative;
		display: block;
		top: calc(-1 * var(--sk-page-padding-top));
		width: 0;
		height: 0;
	}

	.faqs :global(.anchor) {
		position: absolute;
		display: block;
		background: url(/icons/link.svg) 0 50% no-repeat;
		background-size: 1em 1em;
		width: 1.4em;
		height: 1em;
		left: -1.3em;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.faqs :global(h2 > .anchor),
	.faqs :global(h3 > .anchor) {
		top: 0.2em;
	}

	@media (min-width: 768px) {
		.faqs :global(.anchor:focus),
		.faqs :global(:where(h2, h3, h4, h5, h6)):hover :global(.anchor) {
			opacity: 1;
		}

		.faqs :global(h5) :global(.anchor),
		.faqs :global(h6) :global(.anchor) {
			top: 0.25em;
		}
	}

	h2 {
		margin: 3.5rem 0 1rem 0;
		padding: 0 0 0.2em 0;
		color: var(--sk-text-2);
		/* max-width: 24em; */
		font-size: var(--sk-text-m);
		font-weight: 400;
		border-bottom: 1px solid #ddd;
	}

	.faqs :global(h3) {
		font-family: inherit;
		font-weight: 600;
		font-size: 2rem;
		color: var(--sk-theme-2);
		margin: 2rem 0 1.6rem 0;
		padding-left: 0;
		background: transparent;
		line-height: 1.3;
		padding: 0;
		top: 0;
	}

	.faq:first-child {
		margin: 0 0 2rem 0;
		padding: 0 0 4rem 0;
		border-bottom: var(--sk-thick-border-width) solid #6767785b; /* based on --second */
	}
	.faq:first-child h2 {
		font-size: 4rem;
		font-weight: 400;
		color: var(--sk-theme-2);
	}

	:global(.faqs .faq ul) {
		margin-left: 3.2rem;
	}

	.faqs :global(.anchor) {
		top: calc((var(--sk-text-m) - 24px) / 2);
	}

	@media (max-width: 768px) {
		.faqs :global(.anchor) {
			transform: scale(0.6);
			opacity: 1;
			left: -1em;
		}
	}
</style>
