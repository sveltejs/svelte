<script>
	import Blurb from './_components/Blurb.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte.svelte';
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

	.container h3 { color: var(--text) }
	.container ul { list-style: none }

	/* max line-length ~60 chars */
	li:not(.box) > p {
		max-width: var(--linemax)
	}

	/* darken text for accesibility */
	:global(.back-light) {
		--text: hsl(36, 3%, 44%);
	}

	.hero {
		margin: 15rem auto;
	}

	.hero h3, .logotype {
		position: relative;
		left: 3rem;
	}

	.logotype {
		height: 6rem;
	}

	.logo {
		position: absolute;
		top: -4rem;
		right: 0;
		width: 68rem;
		height: 68rem;
		/* mix-blend-mode: multiply; */
		will-change: transform;
	}

	.examples {
		background: var(--second);
		color: white;
		overflow: hidden;
	}

	.example {
		width: 100%;
		height: 420px;
	}

	.example > p {
		margin: 4.4rem 2.4rem 2.4rem 0;
	}

	.repl-container {
		width: 100%;
		height: 100%;
		border-radius: var(--border-r);
		overflow: hidden;
	}

	.contributor {
		width: 2.4em;
		height: 2.4em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat url(/contributors.jpg);
		background-size: auto 102%;
		margin: 0 0.5em 0.5em 0;
		border: 2px solid var(--second);
	}

	@media (min-width: 920px) {
		.example {
			display: grid;
			grid-template-columns: 1fr 3fr;
			grid-gap: 0.5em;
			align-items: start;
		}
	}
</style>

<svelte:head>
	<title>Svelte • The magical disappearing UI framework</title>
</svelte:head>

<svelte:window bind:scrollY={sy}/>

<img alt="Svelte logo" class="logo" src="svelte-logo-outline.svg" style="transform: translate(0, {sy * .2}px)">

<section class="hero container">
	<img alt="Svelte logotype" class="logotype" src="svelte-logotype.svg">
	<h3>Cybernetically enhanced web apps</h3>
</section>

<Blurb/>

<div class="examples">
	<section class="container example linkify">
		<p>Svelte components are built on top of HTML. Just add data.</p>

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
		<p>CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="TODO-blog-post-on-css-in-js">use your favourite CSS-in-JS library</a>.</p>

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
		<p>Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.</p>

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
		<p>Build beautiful UIs with a powerful, performant transition engine built right into the framework.</p>

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

	{#each contributors as contributor, i}
		<a
			class="contributor"
			style="background-position: {100 * i / (contributors.length - 1)}% 0"
			href="https://github.com/{contributor}"
		>{contributor}</a>
	{/each}
</section>
