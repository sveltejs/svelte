<script>
	import Image from './Image.svelte';
	import Machine from './svelte-machine.png?w=640;1280;2560;3840&q=95&format=avif;webp;png&as=picture';
	import SvelteLogotype from './svelte-logotype.svg';
</script>

<div class="hero">
	<strong>Cybernetically enhanced web apps</strong>

	<Image
		src={Machine}
		alt="The Svelte compiler packaging up your component code"
		--max-height="60vh"
	/>

	<img alt="Svelte logotype" class="logotype" src={SvelteLogotype} />
</div>

<style>
	.hero {
		position: relative;
		background: radial-gradient(circle at 40% 30%, rgb(235, 243, 249), rgb(214, 222, 228));
	}

	.logotype {
		display: none;
	}

	strong {
		position: absolute;
		font-size: min(4vw, var(--sk-text-s));
		max-width: 10em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--sk-text-2);
		letter-spacing: 0.05em;
		left: max(var(--sk-page-padding-side), 10%);
		top: 25%;
	}

	@media (min-width: 580px) {
		strong {
			max-width: 12em;
			top: 30%;
		}
	}

	@media (min-width: 800px) {
		.logotype {
			position: absolute;
			display: block;
			width: min(30vw, 36rem);
			bottom: 54%;
			left: 15%;
		}

		strong {
			max-width: 16em;
			top: 49%;
		}

		.logotype,
		strong {
			left: calc(var(--sk-page-padding-side) + 8rem);
		}
	}

	@media (min-width: 1200px) {
		strong,
		.logotype {
			left: calc(50% - 56rem + var(--sk-page-padding-side));
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
