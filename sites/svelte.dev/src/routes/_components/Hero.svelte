<script>
	import Image from "./Image.svelte";
	import Machine from "./svelte-machine.png?w=640;1280;2560;3840&format=avif;webp;png&picture";
	import SvelteLogotype from "./svelte-logotype.svg";
</script>

<div class="hero">
	<strong>Cybernetically enhanced web apps</strong>
	<Image
		src={Machine}
		alt="The Svelte compiler packaging up your component code"
		--max-height="65vh"
	/>
	<img alt="Svelte logotype" class="logotype" src={SvelteLogotype} />
</div>

<style>
	.hero {
		position: relative;
		background: radial-gradient(
			circle at 40% 30%,
			rgb(235, 243, 249),
			rgb(214, 222, 228)
		);
	}

	.logotype {
		display: none;
	}

	strong {
		position: absolute;
		font-size: min(4vw, var(--h4));
		max-width: 10em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--second);
		letter-spacing: 0.05em;
		left: max(var(--side-nav), 10%);
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
			bottom: 58%;
			left: 10%;
		}

		strong {
			max-width: 16em;
			top: 45%;
		}

		.logotype,
		strong {
			left: calc(var(--side-nav) + 4rem);
			/* left: calc(50% - 56rem + var(--side-nav)); */
		}
	}

	@media (min-width: 1200px) {
		strong,
		.logotype {
			left: calc(50% - 56rem + var(--side-nav));
		}
	}
</style>
