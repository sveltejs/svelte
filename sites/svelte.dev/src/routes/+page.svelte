<script>
	import { Blurb } from '@sveltejs/site-kit/components';
	import Demo from './_components/Demo.svelte';
	import Hero from './_components/Hero.svelte';
	import Image from './_components/Image.svelte';
	import Supporters from './_components/Supporters/index.svelte';
	import Try from './_components/Try.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte/index.svelte';
	import Balls from './svelte-balls.png?w=640;1280;2560;3840&format=avif;webp;png&picture';
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
		<h2>Write less code</h2>
		<p>
			Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript
		</p>

		<a href="/blog/write-less-code" class="cta">learn more</a>
	</div>

	<div slot="two">
		<h2>No virtual DOM</h2>
		<p>
			Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays
			fast
		</p>

		<a href="/blog/virtual-dom-is-pure-overhead" class="cta">learn more</a>
	</div>

	<div slot="three">
		<h2>Truly reactive</h2>
		<p>
			No more complex state management libraries — Svelte brings reactivity to JavaScript itself
		</p>

		<a href="/blog/svelte-3-rethinking-reactivity" class="cta">learn more</a>
	</div>
</Blurb>

<Try />

<Demo />

<WhosUsingSvelte />

<Supporters />

<Image src={Balls} alt="The Svelte logo in a ball pit" />

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
</style>
