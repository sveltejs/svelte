<script>
	import Image from './Image.svelte';
	import SvelteLogotype from './svelte-logotype.svg';

	// @ts-ignore
	import Machine from './svelte-machine.png?w=4400&format=avif;webp;png&as=picture';
</script>

<div class="hero">
	<Image
		src={Machine}
		alt="The Svelte compiler packaging up your component code"
		--max-height="60vh"
	/>

	<div class="hero-content">
		<img alt="Svelte logotype" class="logotype" src={SvelteLogotype} />
		<strong>Cybernetically enhanced web apps</strong>
		<a href="/docs/introduction" class="cta"> Read the Docs </a>
	</div>
</div>

<style>
	.hero {
		position: relative;
		background: radial-gradient(circle at 40% 30%, rgb(235, 243, 249), rgb(214, 222, 228));

		height: 45vh;
	}

	.hero :global(picture img) {
		width: 250%;
		transform: translate(-34%, 30%);
	}

	.hero-content {
		position: absolute;
		left: 50%;
		top: clamp(10%, 5rem, 15%);

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		transform: translateX(-50%);

		width: 20em;
		max-width: 100%;
	}

	strong {
		font-size: min(4vw, var(--sk-text-s));
		text-align: center;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--sk-text-2);
		letter-spacing: 0.05em;
	}

	.cta {
		display: inline-block;
		background: var(--sk-theme-1);

		padding: 0.5em 1em;
		margin-top: 0.5em;

		font-size: var(--sk-text-s);

		border-radius: 30px;
		box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.08);

		color: #fff;
		color: color-mix(in hwb, hsl(var(--sk-theme-1-hsl)) 10%, var(--sk-back-1) 95%);

		transition: 0.5s var(--quint-out);
		transition-property: transform, box-shadow;
	}

	.cta:hover {
		text-decoration: none;

		box-shadow: 0px 0.8px 3.8px rgba(0, 0, 0, 0.115), 0px 6px 30px rgba(0, 0, 0, 0.23);

		transform: scale3d(1.01, 1.01, 1);
	}

	@media (min-width: 580px) {
		.hero-content {
			top: 25%;
			left: 26%;

			font-size: 0.9em;
		}

		.logotype {
			width: min(30vw, 30em);
		}

		.hero {
			height: 40vh;
		}

		.hero :global(picture img) {
			width: 200%;
			transform: translate(-20%, -4%);
		}
	}

	@media (max-width: 580px) and (min-width: 360px) {
		.hero {
			margin-bottom: 10rem;
		}
	}

	@media (min-width: 800px) {
		.hero {
			height: 38vh;
			margin-top: 0;
		}

		.hero-content {
			top: 25%;
			left: 30%;
		}

		.logotype {
			width: min(20vw, 20em);
		}

		.hero :global(picture img) {
			width: 140%;
			transform: translate(-10%, -10%);
		}

		.cta {
			font-size: var(--sk-text-m);
		}
	}

	@media (min-width: 1200px) {
		.hero {
			height: 46vh;
		}

		.hero-content {
			top: 25%;
			left: 25%;
		}

		.hero :global(picture img) {
			width: 120%;
			transform: translate(-5%, 0%);
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
