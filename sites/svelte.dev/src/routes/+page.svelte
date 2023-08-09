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
	<meta name="Description" content="Cybernetically enhanced web apps" />
</svelte:head>

<h1 class="visually-hidden">Svelte</h1>

<Hero />

<Blurb --background="var(--sk-back-1)">
	<div slot="one">
		<h2>compilé</h2>
		<p>
			Svelte allège le travail du navigateur en déléguant un maximum de tâches au compilateur. Plus
			besoin d'optimisations manuelles — vos apps sont simplement plus rapides et plus efficaces.
		</p>
	</div>

	<div slot="two">
		<h2>compact</h2>
		<p>
			Écrivez des composants vraiment plus concis en utilisant des langages que vous connaissez déjà
			— HTML, CSS et JavaScript. Ah, et les bundles de vos applications seront également plus
			légers.
		</p>
	</div>

	<div slot="three">
		<h2>complet</h2>
		<p>
			Styles scopés par défaut, gestion d'état, primitives d'animation, liaisons de formulaire et
			bien d'autres — ne perdez plus votre temps à fouiller npm pour des fonctionnalités de bases.
			Tout est inclus.
		</p>
	</div>
</Blurb>

<TrySection>
	<svelte:fragment slot="content-heading">voyez par vous-même</svelte:fragment>
	<svelte:fragment slot="content"
		>Essayez en local, <a target="_blank" rel="noreferrer" href="https://sveltekit.new"
			>sur StackBlitz</a
		>, ou bien avec
		<a target="_blank" href="https://learn-svelte-dev-french.vercel.app">le tutoriel interactif</a
		>.</svelte:fragment
	>
</TrySection>

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
				title: 'tutoriel',
				href: '/tutorial'
			},
			{
				title: 'exemples',
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
	<span slot="copyright">
		Svelte est <a href="https://github.com/sveltejs/svelte">logiciel gratuit en license ouverte</a> publié
		sous la license MIT
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
