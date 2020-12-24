<script>
	import { Blurb, Hero, Section } from '@sveltejs/site-kit';
	import Contributors from './_components/Contributors.svelte';
	import Example from './_components/Example.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte.svelte';
	// import Lazy from '../components/Lazy.svelte';

	// TODO this causes a Sapper CSS bug...
	// function loadReplWidget() {
	// 	console.log('lazy loading');
	// 	return import('../components/Repl/ReplWidget.svelte').then(mod => mod.default);
	// }
</script>

<style>
	/* darken text for accessibility */
	/* TODO does this belong elsewhere? */
	:global(.back-light) {
		--text: hsl(36, 3%, 44%);
	}

	.examples {
		background: var(--second);
		color: white;
		overflow: hidden;
	}
</style>

<svelte:head>
	<title>Svelte • Cybernetically enhanced web apps</title>

	<meta name="twitter:title" content="Svelte">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Cybernetically enhanced web apps">
</svelte:head>

<h1 class="visually-hidden">Svelte</h1>
<Hero
	title="Svelte"
	tagline="Cybernetically enhanced web apps"
	outline="svelte-logo-outline.svg"
	logotype="svelte-logotype.svg"
/>

<Blurb>
	<a href="blog/write-less-code" slot="one">
		<h2>Write less code</h2>
		<p>Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript</p>

		<span class="learn-more">learn more</span>
	</a>

	<a href="blog/virtual-dom-is-pure-overhead" slot="two">
		<h2>No virtual DOM</h2>
		<p>Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast</p>

		<span class="learn-more">learn more</span>
	</a>

	<a href="blog/svelte-3-rethinking-reactivity" slot="three">
		<h2>Truly reactive</h2>
		<p>No more complex state management libraries — Svelte brings reactivity to JavaScript itself</p>

		<span class="learn-more">learn more</span>
	</a>

	<div class="description" slot="what">
		<p>Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.</p>

		<p>Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.</p>

		<p><a href="blog/svelte-3-rethinking-reactivity">Read the introductory blog post</a> to learn more.</p>
	</div>

	<div style="grid-area: start; display: flex; flex-direction: column; min-width: 0" slot="how">
		<pre class="language-bash" style="margin: 0 0 1em 0; min-width: 0; min-height: 0">
npx degit <a href="https://github.com/sveltejs/template" style="user-select: initial;">sveltejs/template</a> my-svelte-project
<span class="token comment"># or download and extract <a href="https://github.com/sveltejs/template/archive/master.zip">this .zip file</a></span>
cd my-svelte-project

npm install
npm run dev
		</pre>

		<p style="flex: 1">See the <a href="blog/the-easiest-way-to-get-started">quickstart guide</a> for more information.</p>

		<p class="cta"><a rel="prefetch" href="tutorial">Learn Svelte</a></p>
	</div>
</Blurb>

<div class="examples">
	<Example id="hello-world">
		<p>Svelte components are built on top of HTML. Just add data.</p>
	</Example>

	<Example id="nested-components">
		<p>CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="/blog/svelte-css-in-js">use your favourite CSS-in-JS library</a>.</p>
	</Example>

	<Example id="reactive-assignments">
		<p>Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.</p>
	</Example>

	<Example id="svg-transitions">
		<p>Build beautiful UIs with a powerful, performant transition engine built right into the framework.</p>
	</Example>
</div>

<Section>
	<h3>Who's using Svelte?</h3>

	<WhosUsingSvelte/>
</Section>

<Section>
	<h3>Contributors</h3>

	<p>Svelte is free and open source software, made possible by the work of dozens of volunteers. <a href="https://github.com/sveltejs/svelte">Join us!</a></p>

	<Contributors/>
</Section>
