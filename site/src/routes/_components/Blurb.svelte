<script>
	import Icon from '../../components/Icon.svelte';
</script>

<style>
	.container {
		position: relative;
		display: grid;
		margin: 10rem auto;
		padding: 0 var(--side-nav);
		max-width: 120rem;
		grid-row-gap: 1em;
		grid-template-areas:
			'one'
			'two'
			'three'
			'what'
			'start';
	}

	h2 {
		margin: 0 0 0.5em 0;
		padding: 0;
		color: white;
	}

	h3 {
		margin: 0 0 1.6rem 0;
		color: black;
	}

	.box {
		padding: 1em;
		display: flex;
		flex-direction: column;
	}

	.box a {
		position: relative;
		text-align: right;
		font-weight: 700;
		padding: 0 2.4rem 0 0;
	}

	.box a :global(svg) {
		stroke: white;
	}

	.box a:hover {
		color: white;
		text-decoration: underline;
	}

	.description { margin: 2em 0 0 0 }

	@media (min-width: 900px) {
		.container {
			grid-column-gap: 1em;
			grid-row-gap: 1em;
			grid-template-columns: repeat(2, 1fr);
			grid-template-areas:
				'one two'
				'three start'
				'what what';
		}

		.box { padding: 2em }
	}

	@media (min-width: 1200px) {
		.container {
			grid-column-gap: 1em;
			grid-row-gap: 5em;
			grid-template-columns: repeat(6, 1fr);
			grid-template-areas:
				'one one two two three three'
				'what what what start start start';
		}

		.description { margin: 0 }
	}
</style>

<section class="container">
	<div class="box bg-prime white" style="grid-area: one">
		<h2>Write less code</h2>
		<p>
			Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript
		</p>

		<a href="TODO-blog-post-on-loc">
			discover how <Icon name="arrow-right"/>
		</a>
	</div>

	<div class="box bg-flash white" style="grid-area: two">
		<h2>No virtual DOM</h2>
		<p>
			Svelte compiles your code to tiny, framework-less vanilla JS — your app
			starts fast and stays fast
		</p>

		<a href="TODO-blog-post-on-vdom-overhead">
			wonder why <Icon name="arrow-right"/>
		</a>
	</div>

	<div class="box bg-second white" style="grid-area: three">
		<h2>Truly reactive</h2>
		<p>
			No more complex state management libraries — Svelte brings reactivity to JavaScript itself
		</p>

		<a href="TODO-blog-post-on-reactivity">
			experience how <Icon name="arrow-right"/>
		</a>
	</div>

	<div class="linkify description" style="grid-area: what;">
		<h3>Svelte up your life</h3>
		<p>
			Svelte is a radical new approach to building user interfaces. Whereas
			traditional frameworks do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.
		</p>

		<p>
			Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.
		</p>

		<p>
			Read the <a href="TODO-svelte-3-blog-post">introductory blog post</a>
			to learn more
		</p>
	</div>

	<div style="grid-area: start; display: flex; flex-direction: column">
		<h3>Convince yourself</h3>
		<pre class="language-bash" style="margin: 0 0 1em 0">
# quick install
npx degit sveltejs/template my-svelte-project
cd my-svelte-project

npm install
npm run dev & open http://localhost:5000
		</pre>

		<p class="linkify" style="flex: 1">
			See the <a href="blog/the-easiest-way-to-get-started">quickstart guide </a> for more information.
		</p>

		<p><a class="btn bg-prime white" rel="prefetch" href="tutorial">
			Learn Svelte <Icon name="arrow-right"/>
		</a></p>
	</div>
</section>
