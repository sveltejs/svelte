<script>
	import * as hovers from '$lib/utils/hovers.js';

	export let data;

	hovers.setup();
</script>

<svelte:head>
	<title>FAQ • Svelte</title>

	<meta name="twitter:title" content="Svelte FAQ" />
	<meta name="twitter:description" content="Frequently asked questions about Svelte" />
	<meta name="description" content="Frequently asked questions about Svelte" />
</svelte:head>

<div class="faqs stretch">
	<h1>Frequently Asked Questions</h1>

	<article class="text">
		{@html data.faq}
	</article>
</div>

<style>
	.faqs {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
		min-height: calc(100vh - var(--sk-nav-height));
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		max-width: var(--sk-page-main-width);
		margin: 0 auto;
		tab-size: 2;
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
