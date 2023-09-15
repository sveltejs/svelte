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

	<meta
		name="twitter:image"
		content="https://sveltejs.github.io/assets/artwork/svelte-5-teaser.jpg"
	/>
	<meta name="og:image" content="https://sveltejs.github.io/assets/artwork/svelte-5-teaser.jpg" />
</svelte:head>

<article class="post listify text">
	<h1>Something magical is coming</h1>
	<p>We've got something to show you. We think you're going to like it.</p>
	<p>
		Join us here on <strong>Wednesday September 20</strong> for a glimpse at the future of Svelte.
	</p>
</article>

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
</style>
