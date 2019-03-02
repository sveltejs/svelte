<script>
	import { getContext } from 'svelte';
	import CodeMirror from '../CodeMirror.svelte';
	import Message from '../Message.svelte';

	const { selected, handle_change, navigate } = getContext('REPL');

	export let error;
	export let errorLoc;
	export let warnings;

	$: message = warning => {
		let str = warning.message;

		let loc = [];

		if (warning.filename && warning.filename !== `${$selected.name}.${$selected.type}`) {
			loc.push(warning.filename);
		}

		if (warning.start) loc.push(warning.start.line, warning.start.column);

		return str + (loc.length ? ` (${loc.join(':')})` : ``);
	};
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
			<Message kind="error" details={error} filename="{$selected.name}.{$selected.type}"/>
		{:else if warnings.length > 0}
			{#each warnings as warning}
				<Message kind="warning" details={warning} filename="{$selected.name}.{$selected.type}"/>
			{/each}
		{/if}
	</div>
</div>