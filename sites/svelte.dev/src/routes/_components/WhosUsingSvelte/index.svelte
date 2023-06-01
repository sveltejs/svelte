<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { theme } from '@sveltejs/site-kit/stores';
	import { companies } from './companies.js';

	const sorted = companies.sort((a, b) => (a.alt < b.alt ? -1 : 1));
</script>

<Section --background={$theme.current === 'light' ? 'var(--sk-back-4)' : '#222'}>
	<section class="whos-using-svelte-container" class:dark={$theme.current === 'dark'}>
		<h3>Who's using Svelte?</h3>
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

	a {
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

	a:last-of-type {
		/* hide last item at this screen size, it ruins wrapping */
		display: none;
	}

	a.invert {
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

		a:last-of-type {
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
