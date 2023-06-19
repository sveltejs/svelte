<script>
	import Example from './Example.svelte';
	import { Section } from '@sveltejs/site-kit/components';

	const examples = [
		{
			id: 'hello-world',
			title: 'Hello World',
			description: 'Svelte components are built on top of HTML. Just add data.'
		},
		{
			id: 'nested-components',
			title: 'Scoped CSS',
			description:
				'CSS is component-scoped by default — no more style collisions or specificity wars. Or you can <a href="/blog/svelte-css-in-js">use your favourite CSS-in-JS library</a >.'
		},
		{
			id: 'reactive-assignments',
			title: 'Reactivity',
			description:
				'Trigger efficient, granular updates by assigning to local variables. The compiler does the rest.'
		},
		{
			id: 'svg-transitions',
			title: 'Transitions',
			description:
				'Build beautiful UIs with a powerful, performant transition engine built right into the framework.'
		}
	];

	let selected = examples[0];
</script>

<svelte:head>
	<link rel="prefetch" href="/fonts/overpass/overpass-latin-400.woff2" />
</svelte:head>

<Section --background="var(--sk-back-2)">
	<h3>build with ease</h3>

	<div class="container">
		<div class="controls">
			<div class="tabs">
				{#each examples as example, i}
					<button
						class="tab"
						class:selected={selected === example}
						on:click={() => (selected = example)}
					>
						<span class="small-show">{i + 1}</span>
						<span class="small-hide">{example.title}</span>
					</button>
				{/each}
			</div>

			<a href="/examples">more <span class="large-show">&nbsp;examples</span> &rarr;</a>
		</div>

		{#if selected}
			<Example id={selected?.id} />
		{/if}
	</div>

	<p class="description">{@html selected?.description}</p>
</Section>

<style>
	h3 {
		font-size: var(--sk-text-xl);
	}

	.description {
		color: var(--sk-text-2);
	}

	.container {
		filter: drop-shadow(6px 10px 20px rgba(0, 0, 0, 0.2));
		margin: 4rem 0;
	}

	.controls {
		position: relative;
		top: 4px;
		display: grid;
		width: 100%;
		height: 5rem;
		grid-template-columns: 4fr 1fr;
		color: var(--sk-text-1);
		align-items: center;
		font-size: var(--sk-text-s);
	}

	a {
		color: unset;
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		height: 100%;
		background-color: var(--sk-back-1);
		border-radius: var(--sk-border-radius);
	}

	button,
	a {
		display: flex;
		text-align: center;
		height: 100%;
		align-items: center;
		justify-content: center;
		border-right: 0.5px solid var(--sk-text-4);
		border-right: 0.5px solid color-mix(in hsl, var(--sk-text-4), transparent 40%);
		background-color: var(--sk-back-4);
		transition: 0.15s ease;
		transition-property: transform, background-color, color;
	}

	button:hover {
		background-color: var(--sk-back-3);
		background-color: color-mix(in srgb, var(--sk-back-4) 70%, var(--sk-back-1) 30%);
	}

	button:has(+ .selected) {
		border-right: initial;
	}

	button:first-child {
		border-radius: var(--sk-border-radius) 0 0 0;
	}
	button:last-child {
		border-radius: 0 var(--sk-border-radius) 0 0;
		border-right: initial;
	}

	button.selected {
		background-color: var(--sk-back-1);
		color: var(--sk-text-2);
		border-radius: var(--sk-border-radius) var(--sk-border-radius) 0 0;
		border-right: initial;
		transform: translateY(-5px);
	}

	a {
		border-right: initial;
		border-radius: 0 var(--sk-border-radius) var(--sk-border-radius) 0;
		background-color: initial;
	}

	.small-show {
		display: block;
	}

	.small-hide {
		display: none;
	}

	.large-show {
		display: none;
	}

	.description :global(a) {
		text-decoration: underline;
	}

	@media (min-width: 640px) {
		.small-show {
			display: none;
		}

		.small-hide {
			display: inline;
		}
	}

	@media (min-width: 960px) {
		.controls {
			font-size: var(--sk-text-s);
		}

		.large-show {
			display: inline;
		}
	}
</style>
