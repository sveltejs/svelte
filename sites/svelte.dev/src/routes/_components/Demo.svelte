<script>
	import Example from './Example.svelte';
	import { Section } from '@sveltejs/site-kit/components';

	const examples = [
		{
			id: 'hello-world',
			title: 'Hello World',
			description:
				"Les composants Svelte sont construits en se basant sur du HTML. Vous n'avez qu'à ajouter de la donnée."
		},
		{
			id: 'nested-components',
			title: 'CSS scopé',
			description:
				'Votre CSS est par défaut scopé à votre composant — plus aucune collision de style ou guerre de spécificité. Vous pouvez aussi <a href="/blog/svelte-css-in-js">utiliser votre librairie CSS-in-JS préférée</a >.'
		},
		{
			id: 'reactive-assignments',
			title: 'Réactivité',
			description:
				"Déclenchez des mises à jour granulaires en assignant à des variables locales. Le compilateur s'occupe du reste."
		},
		{
			id: 'svg-transitions',
			title: 'Transitions',
			description:
				"Construisez de superbes interfaces à l'aide d'un moteur de transition puissant et performant intégré dans le framework."
		}
	];

	let selected = examples[0];
</script>

<svelte:head>
	<link rel="prefetch" href="/fonts/overpass/overpass-latin-400.woff2" />
</svelte:head>

<Section --background="var(--sk-back-2)">
	<h3>développez en toute simplicité</h3>

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

			<a href="/examples">plus d'<span class="large-show">exemples</span> &rarr;</a>
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
