<script>
	import { Blurb } from '@sveltejs/site-kit/components';
	import Demo from './_components/Demo.svelte';
	import Hero from './_components/Hero.svelte';
	import Supporters from './_components/Supporters/index.svelte';
	import Try from './_components/Try.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte/index.svelte';
</script>

<svelte:head>
	<title>Svelte • Cybernetically enhanced web apps</title>

	<meta name="twitter:title" content="Svelte" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="Description" content="Cybernetically enhanced web apps" />
</svelte:head>

<h1 class="visually-hidden">Svelte</h1>

<Hero />

<Blurb --background="var(--sk-back-1)">
	<div slot="one">
		<h2>compiled</h2>
		<p>
			Svelte shifts as much work as possible out of the browser and into your build step. No more
			manual optimisations — just faster, more efficient apps.
		</p>
	</div>

	<div slot="two">
		<h2>compact</h2>
		<p>
			Write breathtakingly concise components using languages you already know — HTML, CSS and
			JavaScript. Oh, and your application bundles will be tiny as well.
		</p>
	</div>

	<div slot="three">
		<h2>complete</h2>
		<p>
			Built-in scoped styling, state management, motion primitives, form bindings and more — don't
			waste time trawling npm for the bare essentials. It's all here.
		</p>
	</div>
</Blurb>

<Try />

<Demo />

<WhosUsingSvelte />

<Supporters />

<section>
	<footer>
		<div class="logo" />
		<div class="links">
			<h4>resources</h4>
			<a href="/docs">documentation</a>
			<a href="/tutorial">tutorial</a>
			<a href="/examples">examples</a>
			<a href="/blog">blog</a>
		</div>
		<div class="links">
			<h4>connect</h4>
			<a href="https://github.com/sveltejs/svelte">github</a>
			<a href="https://opencollective.com/svelte">open collective</a>
			<a href="/chat">discord</a>
			<a href="https://twitter.com/sveltejs">twitter</a>
		</div>
		<div class="copyright">
			© 2023 <a href="https://github.com/sveltejs/svelte/graphs/contributors">Svelte contributors</a
			>
		</div>
		<div class="open-source">
			Svelte is <a href="https://github.com/sveltejs/svelte">free and open source software</a> released
			under the MIT license
		</div>
	</footer>
</section>

<style>
	h2 {
		line-height: 1.05;
	}

	p {
		font-size: var(--sk-text-m);
	}

	section {
		background: var(--sk-back-4);
		padding: 10rem 0;
	}

	footer {
		max-width: 120rem;
		padding: 0 var(--sk-page-padding-side);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: 1fr;
		grid-row-gap: 6rem;
	}

	footer .logo {
		display: none;
		background: url('@sveltejs/site-kit/branding/svelte-logo.svg');
		background-repeat: no-repeat;
		background-size: 8rem;
		filter: grayscale(100%) opacity(84%);
	}

	footer h4 {
		font-size: var(--sk-text-m);
		padding-bottom: 1rem;
	}

	.links a {
		color: var(--sk-text-2);
		font-size: var(--sk-text-s);
		display: block;
		line-height: 1.8;
	}

	.open-source {
		display: none;
		grid-column: span 2;
	}

	.copyright {
		grid-column: span 2;
	}

	@media (min-width: 500px) {
		footer {
			grid-template-columns: repeat(3, 1fr);
		}

		footer .logo {
			display: block;
		}

		.copyright {
			grid-column: span 1;
		}

		.open-source {
			display: block;
		}
	}
</style>
