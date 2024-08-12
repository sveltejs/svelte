<script>
	import Message from '../Message.svelte';
	import AstNode from './AstNode.svelte';
	import { cursorIndex } from '../CodeMirror.svelte';

	/** @type {{ ast: unknown; autoscroll?: boolean }} */
	const { ast, autoscroll = true } = $props();

	// $cursor_index may go over the max since ast computation is usually slower.
	// clamping this helps prevent the collapse view flashing
	const max_cursor_index = $derived(
		!ast ? $cursorIndex : Math.min($cursorIndex, get_ast_max_end(ast))
	);
	const path_nodes = $derived(find_deepest_path(max_cursor_index, [ast]) || []);

	/**
	 * @param {number} cursor
	 * @param {unknown[]} paths
	 * @returns {unknown[] | undefined}
	 */
	function find_deepest_path(cursor, paths) {
		const value = paths[paths.length - 1];

		if (!value) return;

		for (const v of Object.values(value)) {
			if (typeof v === 'object') {
				const result = find_deepest_path(cursor, paths.concat([v]));
				if (result) return result;
			}
		}

		if (
			value !== null &&
			typeof value === 'object' &&
			'start' in value &&
			'end' in value &&
			typeof value.start === 'number' &&
			typeof value.end === 'number' &&
			value.start <= cursor &&
			cursor <= value.end
		) {
			return paths;
		}
	}

	/** @param {unknown} ast */
	function get_ast_max_end(ast) {
		let max_end = 0;

		if (ast === null || typeof ast !== 'object') return max_end;

		for (const node of Object.values(ast)) {
			if (node && typeof node.end === 'number' && node.end > max_end) {
				max_end = node.end;
			}
		}

		return max_end;
	}
</script>

<div class="ast-view">
	<pre>
		<code>
			{#if typeof ast === 'object'}
				<ul>
					<AstNode value={ast} {path_nodes} {autoscroll} collapsed={false} />
				</ul>
			{:else}
				<p>No AST available</p>
			{/if}
		</code>
	</pre>
	<Message kind="info">
		The AST is an internal API and may change at any point without warning.
	</Message>
</div>

<style>
	.ast-view {
		--base: hsl(45, 7%, 45%);
		--string: hsl(41, 37%, 45%);
		--number: hsl(102, 27%, 50%);
		background: var(--sk-back-3);
		color: var(--sk-code-base);
		display: flex;
		flex-direction: column;
	}

	.ast-view,
	pre,
	code {
		height: 100%;
		block-size: 100%;
		font: 400 var(--sk-text-xs) / 1.7 var(--sk-font-mono);
	}

	pre {
		white-space: normal;
		padding: 1rem;
		tab-size: 2;
		-moz-tab-size: 2;
	}

	ul {
		padding: 0;
		margin: 0;
		list-style-type: none;
	}
</style>
