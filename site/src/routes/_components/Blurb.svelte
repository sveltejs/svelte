<style>
	.container {
		position: relative;
		display: grid;
		margin: 10rem auto;
		padding: 0 var(--side-nav);
		max-width: 120rem;
		grid-row-gap: 1em;
		grid-template-areas:
			"one"
			"two"
			"three"
			"what"
			"start";
	}

	.box {
		padding: 1em;
		display: flex;
		flex-direction: column;
	}

	h2 {
		padding: 0;
		margin: 0 0 0.5em 0;
		font-size: var(--h2);
		color: white;
		text-align: left;
	}

	.box a {
		position: relative;
		text-align: right;
		margin-top: auto;
		padding: 0 1.2em 0 0;
	}

	.box a:hover {
		color: white;
		text-decoration: underline;
	}

	.box a::after, .cta a::after {
		content: '';
		position: absolute;
		display: block;
		right: 0;
		top: 0.35em;
		width: 1em;
		height: 1em;
		background: url(/icons/arrow-right.svg);
	}

	.cta a {
		display: inline-block;
		text-align: right;
		background-color: var(--prime);
		padding: 0.5em 1.8em 0.5em 1em;
		border-radius: var(--border-r);
		color: white;
		position: relative;
	}

	.cta a::after {
		right: 0.5em;
		top: 0.75em;
	}

	.description {
		margin: 2em 0 0 0;
	}

	.cta {
		margin: 0;
	}

	@media (min-width: 900px) {
		.container {
			grid-column-gap: 1em;
			grid-row-gap: 1em;
			grid-template-columns: repeat(2, 1fr);
			grid-template-areas:
				"one two"
				"three start"
				"what what";
		}

		.box {
			padding: 2em;
		}

		.cta {
			text-align: right;
		}
	}

	@media (min-width: 1200px) {
		.container {
			grid-column-gap: 1em;
			grid-row-gap: 5em;
			grid-template-columns: repeat(6, 1fr);
			grid-template-areas:
				"one one two two three three"
				"what what what start start start";
		}

		.description {
			margin: 0;
		}

		.cta {
			text-align: left;
		}
	}
</style>

<section class='container'>
	<div class='box bg-prime white' style="grid-area: one">
		<h2>Write less code</h2>
		<p>Build boilerplate-free components using languages you already know — HTML, CSS and JavaScript</p>

		<a href="TODO-blog-post-on-loc">learn more</a>
	</div>

	<div class='box bg-flash white' style="grid-area: two">
		<h2>No virtual DOM</h2>
		<p>Svelte compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast</p>

		<a href="TODO-blog-post-on-vdom-overhead">learn more</a>
	</div>

	<div class='box bg-second white' style="grid-area: three">
		<h2>Truly reactive</h2>
		<p>No more complex state management libraries — Svelte brings reactivity to JavaScript itself</p>

		<a href="TODO-blog-post-on-reactivity">learn more</a>
	</div>

	<div class="linkify description" style="grid-area: what;">
		<p>Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte shifts that work into a <em>compile step</em> that happens when you build your app.</p>

		<p>Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.</p>

		<p><a href="TODO-svelte-3-blog-post">Read the introductory blog post</a> to learn more.</p>
	</div>

	<div style="grid-area: start; display: flex; flex-direction: column; min-width: 0">
		<pre class="language-bash" style="margin: 0 0 1em 0; min-width: 0; min-height: 0">
npx degit sveltejs/template my-svelte-project
cd my-svelte-project

npm install
npm run dev & open http://localhost:5000
		</pre>

		<p class="linkify" style="flex: 1">See the <a href="blog/the-easiest-way-to-get-started">quickstart guide</a> for more information.</p>

		<p class="cta"><a rel="prefetch" href="tutorial">Learn Svelte</a></p>
	</div>
</section>