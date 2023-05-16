<script>
	import { Blurb, theme } from '@sveltejs/site-kit/components';
	import Demo from './_components/Demo.svelte';
	import Hero from './_components/Hero.svelte';
	import Image from './_components/Image.svelte';
	import Supporters from './_components/Supporters/index.svelte';
	import Try from './_components/Try.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte/index.svelte';

	import CollectiveLight from './svelte-collective-light.png?big-image';
	import CollectiveDark from './svelte-collective-dark.png?big-image';
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

		<!-- <a href="/blog/write-less-code" class="cta">learn more</a> -->
	</div>

	<div slot="two">
		<h2>compact</h2>
		<p>
			Write breathtakingly concise components using languages you already know — HTML, CSS and
			JavaScript. Oh, and your application bundles will be tiny as well.
		</p>

		<!-- <a href="/blog/virtual-dom-is-pure-overhead" class="cta">learn more</a> -->
	</div>

	<div slot="three">
		<h2>complete</h2>
		<p>
			Built-in scoped styling, state management, motion primitives, form bindings and more — don't
			waste time trawling npm for the bare essentials. It's all here.
		</p>

		<!-- <a href="/blog/svelte-3-rethinking-reactivity" class="cta">learn more</a> -->
	</div>
</Blurb>

<Try />

<Demo />

<WhosUsingSvelte />

<Supporters />

{#if $theme.current === 'light'}
	<Image lazy src={CollectiveLight} alt="The Svelte logo in a ball pit" />
{:else}
	<Image lazy src={CollectiveDark} alt="The Svelte logo in a ball pit" />
{/if}

<footer>
	<a href="/tutorial">Tutorial</a>
	<a href="/docs">Docs</a>
	<a href="/examples">Examples</a>
	<a href="/blog">Blog</a>
	<a href="/faq">FAQ</a>
	<a href="https://opencollective.com/svelte">Open Collective</a>
</footer>

<style>
	h2 {
		line-height: 1.05;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 4rem;
	}

	footer a {
		color: var(--sk-text-2);
		padding: 0.5rem 1rem;
		display: block;
	}

	p {
		font-size: var(--sk-text-m);
	}
</style>
