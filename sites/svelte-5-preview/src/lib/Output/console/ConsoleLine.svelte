<script>
	import JSONNode from 'svelte-json-tree';
	import ConsoleTable from './ConsoleTable.svelte';

	/** @type {import('./console').Log} */
	export let log;
	export let depth = 1;

	function toggle_group_collapse() {
		log.collapsed = !log.collapsed;
	}
</script>

{#if log.command === 'table'}
	<ConsoleTable data={log.data} columns={log.columns} />
{/if}

<div class="{log.command} line" style="--indent: {depth * 15}px">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="0"
		on:click={toggle_group_collapse}
		class="log"
		class:expandable={log.stack || log.command === 'group'}
	>
		{#if log.count && log.count > 1}
			<span class="count">{log.count}</span>
		{/if}

		{#if log.stack || log.command === 'group'}
			<span class="arrow" class:expand={!log.collapsed}>{'\u25B6'}</span>
		{/if}

		{#if log.command === 'clear'}
			<span class="meta">Console was cleared</span>
		{:else if log.command === 'unclonable'}
			<span class="meta meta-error">Message could not be cloned. Open devtools to see it</span>
		{:else if log.command === 'table'}
			<JSONNode value={log.data} />
		{:else}
			{#each log.args ?? [] as arg}
				<JSONNode value={arg} defaultExpandedLevel={log.expanded ? 1 : 0} />
			{/each}
		{/if}
	</div>

	{#if log.stack && !log.collapsed}
		<div class="stack">
			{#each log.stack as line}
				<span>{line.label}</span>
				<span class="location">{line.location}</span>
			{/each}
		</div>
	{/if}

	{#each new Array(depth - 1) as _, idx}
		<div class="outline" style="left: {idx * 15 + 15}px"></div>
	{/each}
</div>

{#if log.command === 'group' && !log.collapsed}
	{#each log.logs ?? [] as childLog}
		<svelte:self log={childLog} depth={depth + 1} />
	{/each}
{/if}

<style>
	.line {
		--bg: var(--sk-back-1);
		--border: var(--sk-back-3);
		display: block;
		position: relative;
		width: 100%;
		text-align: left;
		border-width: 1px;
		border-style: solid none none none;
		border-color: var(--border);
		background: var(--bg);
	}

	.warn {
		--bg: var(--warning-bg);
		--border: var(--warning-border);
	}

	.error {
		--bg: var(--error-bg);
		--border: var(--error-border);
	}

	.warn,
	.error {
		border-style: solid none;

		& + :global(&) {
			border-top: none;
		}
	}

	.group {
		font-weight: 700;
	}

	.log {
		padding: 5px 10px 5px var(--indent);
		display: flex;
		width: 100%;
		font-size: 12px;
		font-family: var(--sk-font-mono);
		align-items: center;
	}

	.log.expandable {
		cursor: pointer;
		padding-left: calc(var(--indent) + 1em);
	}

	.stack {
		display: grid;
		grid-template-columns: minmax(0, auto) minmax(auto, 1fr);
		grid-gap: 0 2rem;
		font-size: 12px;
		font-family: var(--sk-font-mono);
		margin: 0 1rem 0.4rem calc(1em + var(--indent));
		overflow: hidden;

		.location {
			position: relative;
			background: var(--bg);
			&::before {
				content: '';
				position: absolute;
				width: 1rem;
				height: 100%;
				left: -1rem;
				top: 0;
				background: linear-gradient(to right, transparent, var(--bg));
			}
		}
	}

	.count {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 1.5em;
		height: 1.4em;
		padding: 0.5em;
		border-radius: 0.4rem;
		background-color: var(--sk-text-3, #777);
		color: var(--sk-back-1);
		font-size: 1rem;
	}

	.meta {
		color: var(--sk-text-2, #666);
		font-family: var(--sk-font) !important;
		font-size: 12px;
	}

	.meta-error {
		color: var(--error-fg);
	}

	.outline {
		border-left: 1px solid #9c9cab;
		position: absolute;
		top: 0;
		bottom: -1px;
	}

	.arrow {
		position: absolute;
		font-size: 0.9rem;
		transition: 150ms;
		transform-origin: 50% 50%;
		transform: translateX(-1.2rem) translateY(-1px);
	}

	.arrow.expand {
		transform: translateX(-1.2rem) translateY(0px) rotateZ(90deg);
	}
</style>
