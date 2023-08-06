<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { theme } from '@sveltejs/site-kit/stores';
	import { companies } from './companies.js';

	const sorted = companies.sort((a, b) => (a.alt < b.alt ? -1 : 1));
</script>

<Section --background={$theme.current === 'light' ? 'var(--sk-back-4)' : '#222'}>
	<h3>loved by developers</h3>

	<p>
		We're proud that Svelte was recently voted the <a
			href="https://survey.stackoverflow.co/2023/#section-admired-and-desired-web-frameworks-and-technologies"
			>most admired JS web framework</a
		>
		in one industry survey while drawing the most interest in learning it in
		<a
			href="https://tsh.io/state-of-frontend/#which-of-the-following-frameworks-would-you-like-to-learn-in-the-future"
			>two</a
		> <a href="https://2022.stateofjs.com/en-US/libraries/front-end-frameworks/">others</a>. We
		think you'll love it too.
	</p>

	<section class="whos-using-svelte-container" class:dark={$theme.current === 'dark'}>
		<div class="logos">
			{#each sorted as { href, filename, alt, style, invert, width, height }}
				<a target="_blank" rel="noreferrer" {href} class:invert style={style || ''}>
					<img src="/whos-using-svelte/{filename}" {alt} {width} {height} loading="lazy" />
				</a>

				<span class="spacer" />
			{/each}
		</div>
	</section>
</Section>

<style>
	h3 {
		font-size: var(--sk-text-xl);
	}

	p {
		max-width: 28em; /* text balancing */
	}

	@media (min-width: 1200px) {
		p {
			max-width: 600px;
		}
	}

	.logos {
		display: flex;
		margin: 6rem 0 0 0;
		flex-wrap: wrap;
		row-gap: 1em;
		justify-content: center;
		--row-size: 3;
	}

	.spacer {
		width: calc(100% / calc(2 * var(--row-size) - 1));
	}

	.logos a {
		width: calc(100% / calc(2 * var(--row-size) - 1));
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		color: var(--sk-text-2);
		filter: grayscale(1) contrast(4) opacity(0.4) invert(var(--invert, 0));
		grid-column: span 2;
	}

	.logos a:last-of-type {
		/* hide last item at this screen size, it ruins wrapping */
		display: none;
	}

	.logos a.invert {
		--invert: 1;
	}

	img {
		padding: 5px 10px;
		transition: transform 0.2s;
		min-width: 0; /* Avoid image overflow in Safari */
		width: 100%;
		height: auto;
		/* mix-blend-mode: multiply; */
	}

	@media (min-width: 640px) {
		.logos {
			--row-size: 4;
		}

		.logos a:last-of-type {
			/* show 14 items instead of 13 — wraps better */
			display: flex;
		}
	}

	@media (min-width: 960px) {
		.logos {
			--row-size: 5;
		}
	}

	:global(body.dark) .logos a {
		--invert: 1;
		filter: grayscale(1) contrast(4) opacity(0.7) invert(var(--invert, 0));
	}
</style>
