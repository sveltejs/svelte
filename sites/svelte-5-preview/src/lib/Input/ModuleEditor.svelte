<script>
	import { get_repl_context } from '$lib/context.js';
	import { get_full_filename } from '$lib/utils.js';
	import CodeMirror from '../CodeMirror.svelte';

	/** @type {import('$lib/types').StartOrEnd | null} */
	export let errorLoc = null;

	/** @type {boolean} */
	export let autocomplete;

	export function focus() {
		$module_editor?.focus();
	}

	const { bundle, handle_change, module_editor, selected, bundling } = get_repl_context();

	async function diagnostics() {
		/** @type {import('@codemirror/lint').Diagnostic[]} */
		const diagnostics = [];

		if (!$selected || !$bundle) return diagnostics;

		await $bundling;

		const filename = get_full_filename($selected);

		if (
			$bundle.error &&
			$bundle.error.filename === filename &&
			$bundle.error.start &&
			$bundle.error.end
		) {
			diagnostics.push({
				from: $bundle.error.start.character,
				to: $bundle.error.end.character,
				severity: 'error',
				message: $bundle.error.message
			});
		}

		for (const warning of $bundle.warnings) {
			if (warning.filename === filename) {
				diagnostics.push({
					from: warning.start.character,
					to: warning.end.character,
					severity: 'warning',
					message: warning.message
				});
			}
		}

		return diagnostics;
	}
</script>

<div class="editor-wrapper">
	<div class="editor notranslate" translate="no">
		<CodeMirror
			bind:this={$module_editor}
			{errorLoc}
			{autocomplete}
			diagnostics={$selected && $bundle ? diagnostics : () => []}
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
