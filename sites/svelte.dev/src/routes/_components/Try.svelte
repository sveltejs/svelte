<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { TryTerminal } from '@sveltejs/site-kit/components';
</script>

<div class="try-container">
	<Section --background="var(--background-2)">
		<div class="grid" style="--columns: 2">
			<div class="try">
				<TryTerminal />

				<p class="create-an-app">
					...or
					<a target="_blank" rel="noreferrer" href="https://sveltekit.new"> create an app </a>
					on StackBlitz.
				</p>
			</div>

			<div class="description">
				<p>
					Svelte is a radical new approach to building user interfaces. Whereas traditional
					frameworks like React and Vue do the bulk of their work in the <em>browser</em>, Svelte
					shifts that work into a
					<em>compile step</em> that happens when you build your app. No more virtual DOM!
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
					>
					to learn more.
				</p>
			</div>
		</div>
	</Section>
</div>

<style>
	.try-container {
		--background-2: var(--sk-back-4);
	}

	:global(body.dark .try-container) {
		--background-2: #444;
	}

	@media (prefers-color-scheme: dark) {
		.try-container {
			--background-2: #444;
		}

		:global(body.light .try-container) {
			--background-2: var(--sk-back-4) !important;
		}
	}

	.grid {
		display: grid;
		gap: 1em;
		margin: 0 0 4rem 0;
	}

	.grid:last-child {
		margin-bottom: 0;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(var(--columns), 1fr);
			gap: 7rem;
		}
	}

	.create-an-app {
		font-size: 0.75em;
	}

	.grid *::selection {
		background: hsl(15, 100%, 65%);
		color: white;
	}

	.description {
		color: var(--sk-text-1);
	}

	.description p:first-child {
		margin-top: 0;
	}

	.try {
		width: 100%;
		margin: 0 auto;
		font-size: var(--sk-text-m);
		color: var(--sk-text-1);
	}

	a {
		color: inherit;
		text-decoration: underline;
	}
</style>
