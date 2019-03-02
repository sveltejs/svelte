<script>
	import { getContext } from 'svelte';
	import CodeMirror from '../CodeMirror.svelte';

	const { selected, handle_change, navigate } = getContext('REPL');

	export let error;
	export let errorLoc;
	export let warningCount = 0;
</script>

<style>
	.editor-wrapper {
		z-index: 5;
		background: var(--back-light);
		display: flex;
		flex-direction: column;
	}

	.editor {
		height: 0;
		flex: 1;
	}

	.info p {
		position: relative;
		color: white;
		padding: 1.2rem 1.6rem 1.2rem 4.4rem;
		font: 400 1.2rem/1.7 var(--font);
		margin: 0;
		border-top: 1px solid white;
	}

	.info p::before {
		content: '!';
		position: absolute;
		left: 1.2rem;
		top: 1.1rem;
		width: 1rem;
		height: 1rem;
		text-align: center;
		line-height: 1;
		padding: .4rem;
		border-radius: 50%;
		color: white;
		border: .2rem solid white;
	}

	.error {
		background-color: #da106e;
	}

	.warning {
		background-color: #e47e0a;
	}

	@media (min-width: 600px) {
		.editor-wrapper.columns {
			/* make it easier to interact with scrollbar */
			padding-right: 8px;
			height: auto;
			/* height: 100%; */
		}
	}
</style>

<div class="editor-wrapper">
	<div class="editor">
		{#if $selected}
			<CodeMirror
				mode="{$selected.type === 'js' ? 'javascript' : 'handlebars'}"
				code={$selected.source}
				{errorLoc}
				on:change={handle_change}
			/>
		{/if}
	</div>

	<div class="info">
		{#if error}
			<p class="error" on:click="{() => navigate(error)}">{error.message}</p>
		{:else if warningCount > 0}
			<p class="warning">Compiled, but with {warningCount} {warningCount === 1 ? 'warning' : 'warnings'} — check the console for details</p>
		{/if}
	</div>
</div>