<script>
	import { get_repl_context } from '$lib/context.js';
	import CodeMirror from '../CodeMirror.svelte';

	/** @type {boolean} */
	export let autocomplete;

	/** @type {any} */ // TODO
	export let error;

	/** @type {any[]} */ // TODO
	export let warnings;

	export function focus() {
		$module_editor?.focus();
	}

	const { handle_change, module_editor } = get_repl_context();
</script>

<div class="editor-wrapper">
	<div class="editor notranslate" translate="no">
		<CodeMirror
			bind:this={$module_editor}
			{autocomplete}
			diagnostics={() => {
				if (error) {
					return [
						{
							severity: 'error',
							from: error.position[0],
							to: error.position[1],
							message: error.message
						}
					];
				}

				if (warnings) {
					return warnings.map((warning) => ({
						severity: 'warning',
						from: warning.start.character,
						to: warning.end.character,
						message: warning.message
					}));
				}

				return [];
			}}
			on:change={handle_change}
		/>
	</div>
</div>

<style>
	.editor-wrapper {
		z-index: 5;
		background: var(--sk-back-3);
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.editor {
		height: 0;
		flex: 1 1 auto;
	}

	:global(.columns) .editor-wrapper {
		/* make it easier to interact with scrollbar */
		padding-right: 8px;
		height: auto;
		height: 100%;
	}
</style>
