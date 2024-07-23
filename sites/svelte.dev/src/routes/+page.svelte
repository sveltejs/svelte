<script>
	import { Blurb, Footer, TrySection } from '@sveltejs/site-kit/home';
	import Demo from './_components/Demo.svelte';
	import Hero from './_components/Hero.svelte';
	import Supporters from './_components/Supporters/index.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte/index.svelte';
</script>

<svelte:head>
	<title>Svelte • Cybernetically enhanced web apps</title>

	<meta name="twitter:title" content="Svelte" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="description" content="Cybernetically enhanced web apps" />
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

<TrySection />

<Demo />

<WhosUsingSvelte />

<Supporters />

<Footer
	links={{
		resources: [
			{
				title: 'documentation',
				href: '/docs'
			},
			{
				title: 'tutorial',
				href: '/tutorial'
			},
			{
				title: 'examples',
				href: '/examples'
			},
			{
				title: 'blog',
				href: '/blog'
			}
		],
		connect: [
			{
				title: 'github',
				href: 'https://github.com/sveltejs/svelte'
			},
			{
				title: 'opencollective',
				href: 'https://opencollective.com/svelte'
			},
			{
				title: 'discord',
				href: '/chat'
			},
			{
				title: 'twitter',
				href: 'https://twitter.com/sveltejs'
			}
		]
	}}
>
	<span slot="license">
		Svelte is <a href="https://github.com/sveltejs/svelte">free and open source software</a> released
		under the MIT license
	</span>
</Footer>

<style>
	h2 {
		line-height: 1.05;
	}

	p {
		font-size: var(--sk-text-m);
	}
</style>
