<script>
	import { Blurb } from '@sveltejs/site-kit/components';
	import Supporters from './_components/Supporters/index.svelte';
	import Hero from './_components/Hero.svelte';
	import Image from './_components/Image.svelte';
	import Demo from './_components/Demo.svelte';
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

<div class="blurb-shifter">
	<Blurb>
		<div slot="one">
			<h2>Write less code</h2>
			<p>
				Build boilerplate-free components using languages you already know — HTML, CSS and
				JavaScript
			</p>

			<a href="/blog/write-less-code" class="cta">learn more</a>
		</div>

		<div slot="two">
			<h2>No virtual DOM</h2>
			<p>
				Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and
				stays fast
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

		<div class="description" slot="four">
			<p>
				Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks
				like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that
				work into a
				<em>compile step</em> that happens when you build your app.
			</p>

			<p>
				Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically
				updates the DOM when the state of your app changes.
			</p>

			<p>
				We're proud that Svelte was recently voted the <a
					href="https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks"
					>most loved web framework</a
				>
				with the
				<a href="https://2020.stateofjs.com/en-US/technologies/front-end-frameworks/"
					>most satisfied developers</a
				>
				drawing the
				<a
					href="https://tsh.io/state-of-frontend/#which-of-the-following-frameworks-would-you-like-to-learn-in-the-future"
					>most interest in learning it</a
				>
				in a trio of industry surveys. We think you'll love it too.
				<a href="/blog/svelte-3-rethinking-reactivity" class="cta"
					>Read the introductory blog post</a
				> to learn more.
			</p>
		</div>

		<div slot="five">
			<pre><code
					>npm create svelte@latest myapp
cd myapp
npm install
npm run dev
			</code></pre>

			<a href="/tutorial" class="cta">Learn Svelte</a>
		</div>
	</Blurb>
</div>

<Demo />

<section>
	<h3>Who's using Svelte?</h3>

	<WhosUsingSvelte />
</section>

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
	section {
		position: relative;
		margin: 10rem auto;
		padding: 0 var(--side-nav);
		max-width: 120rem;
	}

	.blurb-shifter {
		margin-top: calc(-10rem + var(--side-nav));
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 4rem;
	}

	footer a {
		color: var(--text);
		padding: 0.5rem 1rem;
		display: block;
	}

	/* @media (min-width: 900px) {
		.blurb-shifter {
			margin-top: -12em;
		}
	} */
</style>
