<script>
	import Icon from '../components/Icon.svelte';
	import Logo from '../components/Logo.svelte';
	import WhosUsingSvelte from '../components/WhosUsingSvelte/index.svelte';
	import IntersectionObserver from '../components/IntersectionObserver.svelte';
	// import Lazy from '../components/Lazy.svelte';
	import ReplWidget from '../components/Repl/ReplWidget.svelte';
	import contributors from './_contributors.js';

	let sy = 0;

	// TODO this causes a Sapper CSS bug...
	// function loadReplWidget() {
	// 	console.log('lazy loading');
	// 	return import('../components/Repl/ReplWidget.svelte').then(mod => mod.default);
	// }
</script>

<style>
	.container {
		position: relative;
		margin: 10rem auto;
		padding: 0 var(--side-nav);
		max-width: 120rem;
	}

	.container ul {
		list-style: none;
	}

	/* max line-length ~60 chars */
	li:not(.box) > p {
		max-width: var(--linemax)
	}

	/* darken text for accesibility */
	:global(.back-light) {
		--text: hsl(36, 3%, 44%);
	}

	.logo {
		position: absolute;
		left: -120px;
		top: -120px;
		width: 80vmin;
		height: 80vmin;
		opacity: 0.1;
		will-change: transform;
	}

	.hero h1 {
		text-align: center;
		margin: 2rem 0;
		font-size: 6rem;
		color: var(--heading);
		font-weight: 100;
		letter-spacing: .12em;
		text-transform: uppercase;
	}

	.hero h2 {
		text-align: center;
		display: block;
		position: relative;
		font-size: 3.2rem;
		text-align: center;
		width: 100%;
		text-transform: lowercase;
		font-weight: 300;
		opacity: 0.7;
	}

	.box {
		padding: 2em;
		display: flex;
		flex-direction: column;
	}

	.box > h2 {
		padding: 0;
		margin: 0 0 0.5em 0;
		font-size: var(--h2);
		color: white;
		text-align: left;
	}

	.box > p {
		font-size: var(--h5);
	}

	.box a {
		position: relative;
		text-align: right;
		margin-top: auto;
		padding: 0 1.2em 0 0;
		font-family: Roboto, sans-serif;
		font-size: 1.6rem;
	}

	.box a:hover {
		color: white;
		text-decoration: underline;
	}

	.box a::after, .cta::after {
		content: '';
		position: absolute;
		display: block;
		right: 0;
		top: 0.25em;
		width: 1em;
		height: 1em;
		background: url(/icons/arrow-right.svg);
	}

	.cta::after {
		right: 0.5em;
		top: 0.6em;
	}

	.examples {
		background: var(--second);
		color: white;
		/* padding: 2em 0; */
		overflow: hidden;
	}

	.example {
		/* background: var(--second);
		color: white;
		padding: 0.8rem;
		border-radius: var(--border-r); */
		width: 100%;
		height: 420px;
	}

	.repl-container {
		width: 100%;
		height: 100%;
		border-radius: var(--border-r);
		overflow: hidden;
	}

	.example > div:first-child {
		/* padding: 0.8rem; */
	}

	a.cta {
		background-color: var(--prime);
		padding: 0.5em 1.8em 0.5em 1em;
		border-radius: var(--border-r);
		color: white;
		position: relative;
	}

	.contributor {
		width: 2.4em;
		height: 2.4em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background-size: 100% 100%;
		margin: 0 0.5em 0.5em 0;
		border: 1px solid var(--second);
	}

	@media (min-width: 920px) {
		.example {
			display: grid;
			grid-template-columns: 1fr 4fr;
			grid-gap: 0.5em;
			align-items: start;
		}
	}

	@media screen and (min-width: 870px) {
		.hero h1 {
			position: relative;
			top: -.8rem;
			font-size: 18rem;
			margin: 2rem 2rem 0 1rem;
		}
	}
</style>

<svelte:head>
	<title>Svelte • The magical disappearing UI framework</title>
</svelte:head>

<svelte:window bind:scrollY={sy}/>

<img alt="Svelte logo" class="logo" src="logo.svg" style="transform: translate(0,{sy * 0.2}px)">

<section class="hero container">
	<h2>Cybernetically enhanced web apps</h2>
	<h1>Svelte</h1>
</section>

<section class='container'>
	<ul class='grid stretch'>
		<li class='box bg-prime white'>
			<h2 style='padding:2.4rem 0 0 0'>Write less code</h2>
			<p>Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript</p>

			<a href="TODO-blog-post-on-loc">learn more</a>
		</li>

		<li class='box bg-flash white'>
			<h2 style='padding:2.4rem 0 0 0'>No virtual DOM</h2>
			<p>Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast</p>

			<a href="TODO-blog-post-on-vdom-overhead">learn more</a>
		</li>

		<li class='box bg-second white'>
			<h2 style='padding:2.4rem 0 0 0'>Truly reactive</h2>
			<p>No more complex state management libraries — Svelte brings reactivity to JavaScript itself</p>

			<a href="TODO-blog-post-on-reactivity">learn more</a>
		</li>
	</ul>
</section>

<section class="container grid half">
	<div class="linkify">
		<p>Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.</p>

		<p>Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.</p>

		<p><a href="TODO-svelte-3-blog-post">Read the introductory blog post</a> to learn more.</p>
	</div>

	<div>
		<pre class="language-bash">
npx degit sveltejs/template my-svelte-project
cd my-svelte-project

npm install
npm run dev & open http://localhost:5000
		</pre>

		<p class="linkify">See the <a href="blog/the-easiest-way-to-get-started">quickstart guide</a> for more information.</p>

		<p><a rel="prefetch" class="cta" href="tutorial">Learn Svelte</a></p>
	</div>
</section>

<div class="examples">
	<section class="container example linkify">
		<div>
			<p>Svelte components are built on top of HTML. Just add data.</p>
		</div>

		<div class="repl-container">
			<IntersectionObserver once let:intersecting top={400}>
				{#if intersecting}
					<!-- <Lazy this={loadReplWidget} example="hello-world"/> -->
					<ReplWidget example="hello-world"/>
				{/if}
			</IntersectionObserver>
		</div>
	</section>

	<section class="container example linkify">
		<div>
			<p>CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="TODO-blog-post-on-css-in-js">use your favourite CSS-in-JS library</a>.</p>
		</div>

		<div class="repl-container">
			<IntersectionObserver once let:intersecting top={400}>
				{#if intersecting}
					<!-- <Lazy this={loadReplWidget} example="nested-components"/> -->
					<ReplWidget example="nested-components"/>
				{/if}
			</IntersectionObserver>
		</div>
	</section>

	<section class="container example linkify">
		<div>
			<p>Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.</p>
		</div>

		<div class="repl-container">
			<IntersectionObserver once let:intersecting top={400}>
				{#if intersecting}
					<!-- <Lazy this={loadReplWidget} example="reactive-assignments"/> -->
					<ReplWidget example="reactive-assignments"/>
				{/if}
			</IntersectionObserver>
		</div>
	</section>

	<section class="container example linkify">
		<div>
			<p>Build beautiful UIs with a powerful, performant transition engine built right into the framework.</p>
		</div>

		<div class="repl-container">
			<IntersectionObserver once let:intersecting top={400}>
				{#if intersecting}
					<!-- <Lazy this={loadReplWidget} example="svg-transitions"/> -->
					<ReplWidget example="svg-transitions"/>
				{/if}
			</IntersectionObserver>
		</div>
	</section>
</div>

<section class="container">
	<h3>Who's using Svelte?</h3>

	<WhosUsingSvelte/>
</section>

<section class="container">
	<h3>Contributors</h3>

	<p class="linkify">Svelte is free and open source software, made possible by the work of dozens of volunteers. <a href="https://github.com/sveltejs/svelte">Join us!</a></p>

	{#each contributors as contributor}
		<a
			class="contributor"
			style="background-image: url({contributor.src})"
			href="https://github.com/{contributor.name}"
		>{contributor.name}</a>
	{/each}
</section>