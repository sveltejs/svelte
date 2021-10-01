<script context="module">
	export async function preload() {
		const faqs = await this.fetch(`faq.json`).then(r => r.json());
		return { faqs };
	}
</script>

<script>
	const description = "Frequently Asked Questions about Svelte"

	export let faqs;
</script>

<svelte:head>
	<title>Frequently Asked Questions • Svelte</title>

	<meta name="twitter:title" content="Svelte FAQ">
	<meta name="twitter:description" content={description}>
	<meta name="Description" content={description}>
</svelte:head>

<div class='faqs stretch'>
	<h1>Frequently Asked Questions</h1>
	{#each faqs as faq}

		<article class='faq'>
			<h2>
			<span id={faq.fragment} class="offset-anchor"></span>
			<a class="anchor" href='faq#{faq.fragment}' title='{faq.question}'>&nbsp;</a>
			{faq.metadata.question}
			</h2>
			<p>{@html faq.answer}</p>
		</article>
	{/each}
</div>

<style>
	.faqs {
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
		min-height: calc(100vh - var(--nav-h));
		padding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);
		max-width: var(--main-width);
		margin: 0 auto;
	}

	h2 {
		display: inline-block;
		margin: 3.2rem 0 1rem 0;
		color: var(--text);
		max-width: 18em;
		font-size: var(--h3);
		font-weight: 400;
	}

	.faq:first-child {
		margin: 0 0 2rem 0;
		padding: 0 0 4rem 0;
		border-bottom: var(--border-w) solid #6767785b; /* based on --second */
	}

	.faq:first-child h2 {
		font-size: 4rem;
		font-weight: 400;
		color: var(--second);
	}

	.faq p {
		font-size: var(--h5);
		max-width: 30em;
		color: var(--second);
	}

	:global(.faqs .faq ul) {
		margin-left: 3.2rem;
	}

	.faqs :global(.anchor) {
		top: calc((var(--h3) - 24px) / 2);
	}

	@media (max-width: 768px) {
		.faqs :global(.anchor) {
			transform: scale(0.6);
			opacity: 1;
			left: -1.0em;
		}
	}
</style>
