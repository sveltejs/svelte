<script>
	import { getContext } from 'svelte';
	import Example from './Example.svelte';
	import Section from './Section.svelte';

	const examples = getContext('repl_widget_examples');

	$: selected = examples[0];
</script>

<Section --background="radial-gradient(circle at 40% 30%, rgb(110, 113, 118), rgb(81, 93, 106))">
	<h3>Why Svelte?</h3>

	<div class="container">
		<div class="controls">
			<div class="tabs">
				{#each examples as example, i}
					<button on:click={() => (selected = example)} class:selected={selected === example}>
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
		color: white;
	}

	.description {
		color: white;
		height: 12rem; /* prevent layout popping when tab changes */
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
		color: white;
		align-items: center;
		font-size: var(--h5);
	}

	.tabs {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		height: 100%;
		border-radius: var(--border-r) var(--border-r) 0 0;
		background-color: rgba(255, 255, 255, 0.1);
	}

	button,
	a {
		display: flex;
		text-align: center;
		height: 100%;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-r) var(--border-r) 0 0;
	}

	button:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	button.selected {
		background-color: var(--sk-back-1);
		color: var(--sk-text-2);
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

	a,
	.description :global(a) {
		color: white;
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
			font-size: var(--h4);
		}

		.large-show {
			display: inline;
		}
	}
</style>
