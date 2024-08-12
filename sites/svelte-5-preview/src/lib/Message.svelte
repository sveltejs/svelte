<script>
	import { slide } from 'svelte/transition';
	import { get_repl_context } from './context.js';

	/** @type {{
	 *   kind: 'info' | 'warning' | 'error',
	 *   details?: import('./types').MessageDetails | undefined,
	 *   filename?: string | undefined,
	 *   truncate?: boolean,
	 *   children: import('svelte').Snippet,
	 * }} */
	const { kind = 'info', details = undefined, filename = undefined, truncate = false, children } = $props();

	const { go_to_warning_pos } = get_repl_context();

	/** @param {import('./types').MessageDetails} details */
	function message(details) {
		let str = details.message || '[missing message]';

		let loc = [];

		if (details.filename && details.filename !== filename) loc.push(details.filename);

		if (details.start) loc.push(details.start.line, details.start.column);

		return str + (loc.length ? ` (${loc.join(':')})` : ``);
	}
</script>

<div transition:slide={{ duration: 100 }} class="message {kind}" class:truncate>
	{#if details}
		<button
			class:navigable={details.filename}
			onclick={() => go_to_warning_pos(details)}
			onkeyup={(e) => e.key === ' ' && go_to_warning_pos(details)}
		>
			{message(details)}
		</button>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	button {
		white-space: pre;
	}

	.message {
		position: relative;
		color: white;
		padding: 12px 16px 12px 44px;
		font: 400 12px/1.7 var(--sk-font);
		margin: 0;
		border-top: 1px solid white;
	}

	.navigable {
		cursor: pointer;
	}

	.message::before {
		content: '!';
		position: absolute;
		left: 12px;
		top: 10px;
		text-align: center;
		line-height: 1;
		padding: 4px;
		border-radius: 50%;
		color: white;
		border: 2px solid white;
		box-sizing: content-box;
		width: 10px;
		height: 10px;
		font-size: 11px;
		font-weight: 700;
	}

	.truncate {
		white-space: pre;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	button {
		margin: 0;
		text-align: start;
	}

	.error {
		background-color: #da106e;
	}

	.warning {
		background-color: #e47e0a;
	}

	.info {
		background-color: var(--sk-theme-2);
	}
</style>
