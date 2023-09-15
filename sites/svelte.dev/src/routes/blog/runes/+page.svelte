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

<div class="teaser">
	<div class="copy">
		<div class="copy-inner">
			<h1>Something magical is coming</h1>
			<p>We've got something to show you. We think you're going to like it.</p>
			<p>
				Join us here on <strong>Wednesday September 20</strong> for a glimpse at the future of Svelte.
			</p>
		</div>
	</div>
</div>

<style>
	.teaser {
		display: flex;
		flex-direction: column;
		justify-content: end;
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: black;
		background-image: url(https://sveltejs.github.io/assets/artwork/svelte-5-teaser-background.jpg);
		background-size: cover;
		background-position: center;
	}

	.copy {
		padding: var(--sk-page-padding-top) var(--sk-page-padding-side) 6rem var(--sk-page-padding-side);
		width: 100%;
		margin: 0 auto;
		color: white;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		padding-bottom: 8rem;
	}

	.copy-inner {
		max-width: 70rem;
		margin: 0 auto;
	}

	h1,
	p {
		color: white;
	}

	h1 {
		margin: 0 0 0em 0;
		line-height: 1.2;
		max-width: 9em;
		font-size: 4rem;
	}

	p {
		margin: 0.5em 0;
		text-wrap: balance;
	}

	strong {
		white-space: nowrap;
	}

	@media (min-width: 600px) {
		h1 {
			max-width: none;
		}
	}

	@media (min-width: 800px) {
		h1 {
			font-size: 5.4rem;
		}
		p {
			font-size: 2rem;
		}
	}
</style>
