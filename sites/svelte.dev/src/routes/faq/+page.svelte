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
</style>
