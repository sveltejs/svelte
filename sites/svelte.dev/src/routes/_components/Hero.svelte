<script>
	import { Icon } from '@sveltejs/site-kit/components';
	import SvelteLogotype from './svelte-logotype.svg';
	// @ts-ignore
	import MachineDesktop from './svelte-machine-desktop.png?w=1200;2000;2800;4400&format=avif;webp;png;&as=picture';
	// @ts-ignore
	import MachineMobile from './svelte-machine-mobile.png?w=960&format=avif;webp;png;&as=picture';

	const srcset = (sources) => sources.map(({ src, w }) => `${src} ${w}w`).join(', ');
</script>

<div class="hero">
	<div class="hero-content">
		<img alt="Svelte logotype" class="logotype" src={SvelteLogotype} />
		<strong>
			<span style="white-space: nowrap;">Cybernetically enhanced</span> <br /> web apps
		</strong>
		<div class="buttons">
			<a href="https://learn.svelte.dev" rel="external" class="cta">
				tutorial<Icon name="external-link" size="1em" />
			</a>
			<a href="/docs/introduction" class="cta basic">read the docs</a>
		</div>
	</div>

	<picture class="machine">
		<source
			srcset={srcset(MachineDesktop.sources.avif)}
			type="image/avif"
			media="(min-width: 800px)"
		/>
		<source
			srcset={srcset(MachineDesktop.sources.webp)}
			type="image/webp"
			media="(min-width: 800px)"
		/>
		<source
			srcset={srcset(MachineDesktop.sources.png)}
			type="image/png"
			media="(min-width: 800px)"
		/>
		<source srcset={srcset(MachineMobile.sources.avif)} type="image/avif" />
		<source srcset={srcset(MachineMobile.sources.webp)} type="image/webp" />
		<source srcset={srcset(MachineMobile.sources.png)} type="image/png" />
		<img alt="The Svelte compiler packaging up your component code" src={MachineMobile.img.src} />
	</picture>
</div>

<style>
	.hero {
		position: relative;
		background: radial-gradient(circle at 40% 30%, rgb(235, 243, 249), rgb(214, 222, 228));
		padding: 6rem 0 34vw 0;
		margin-bottom: 3rem;
	}

	.machine img {
		position: absolute;
		pointer-events: none;
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 4rem;
	}

	strong {
		font-size: var(--sk-text-l);
		text-align: center;
		font-family: var(--sk-font);
		text-transform: lowercase;
		font-weight: 400;
		color: var(--sk-text-2);
		line-height: 1.2;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.cta {
		display: flex;
		align-items: center;
		gap: 0.1rem;
		background: var(--sk-theme-1);
		padding: 0.35em 0.8em;
		font-size: var(--sk-text-s);
		letter-spacing: 0.05em;
		font-weight: 600;
		white-space: nowrap;
		border-radius: var(--sk-border-radius);
		box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.08);
		color: #fff;
		color: color-mix(in hwb, hsl(var(--sk-theme-1-hsl)) 10%, var(--sk-back-1) 95%);
		transition: 0.5s var(--quint-out);
		transition-property: box-shadow, color;
	}

	.cta:hover {
		text-decoration: none;
		box-shadow: 0px 0.8px 3.8px rgba(0, 0, 0, 0.115), 0px 6px 30px rgba(0, 0, 0, 0.23);
	}

	.cta.basic {
		background-color: var(--sk-back-5);

		color: var(--sk-text-1);
	}

	.logotype {
		width: min(45vw, 40em);
	}

	@media (min-width: 800px) {
		.hero-content {
			--width: clamp(60rem, 50vw, 80rem);
			position: absolute;
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-column-gap: 4rem;
			grid-row-gap: 2rem;
			width: var(--width);
			left: calc(0.5 * (100% - min(100vw, 120rem)) + var(--sk-page-padding-side));
			top: 6rem;
			font-size: 0.9em;
		}

		.logotype {
			width: 100%;
			justify-self: end;
		}

		strong {
			text-align: left;
			font-size: calc(0.04 * var(--width));
		}

		.hero {
			height: calc(14rem + 20vw);
			padding: 14rem 0 0 0;
		}
	}

	@media (min-width: 1400px) {
		.hero-content {
			grid-template-columns: 1fr;
			width: calc(0.5 * var(--width));
			top: 6vw;
		}

		.hero {
			height: calc(10rem + 20vw);
			padding: 10rem 0 0 0;
		}
	}

	:global(body.dark) .hero {
		background: radial-gradient(
				64.14% 72.25% at 47.58% 31.75%,
				hsl(209deg 6% 47% / 52%) 0%,
				hsla(0, 0%, 100%, 0) 100%
			),
			linear-gradient(
				92.4deg,
				hsl(210, 7%, 16%) 14.67%,
				hsl(0deg 0% 0% / 48%) 54.37%,
				hsla(207, 22%, 13%, 0.62) 92.49%
			),
			linear-gradient(0deg, hsl(204, 38%, 20%), hsl(204, 10%, 90%));
	}

	:global(body.dark) .logotype {
		filter: invert(4) brightness(1.2);
	}
</style>
