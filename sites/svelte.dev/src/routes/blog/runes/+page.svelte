<script>
	import { assets } from '$app/paths';
	import { page } from '$app/stores';
	import teaser from './teaser.jpg';
</script>

<svelte:head>
	<title>Something magical is coming</title>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Something magical is coming" />
	<meta
		name="twitter:description"
		content="We've got something to show you. We think you're going to like it."
	/>
	<meta
		name="Description"
		content="We've got something to show you. We think you're going to like it."
	/>

	<meta name="twitter:image" content="{$page.url.origin}{teaser}" />
	<meta name="og:image" content="{$page.url.origin}{teaser}" />
</svelte:head>

<article class="post listify text">
	<h1>Something magical is coming</h1>
	<p>We've got something to show you. We think you're going to like it.</p>
	<p>
		Join us here on <strong>Wednesday September 20</strong> for a glimpse at the future of Svelte.
	</p>
</article>

<!-- the crawler doesn't understand twitter:image etc, so we have to add this hack. TODO fix in sveltekit -->
<img hidden src={teaser} alt="Social card for teaser page" />

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
