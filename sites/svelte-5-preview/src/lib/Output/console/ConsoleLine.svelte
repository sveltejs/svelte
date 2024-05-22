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
			<span class="info">Console was cleared</span>
		{:else if log.command === 'unclonable'}
			<span class="info error">Message could not be cloned. Open devtools to see it</span>
		{:else if log.command === 'table'}
			<JSONNode value={log.data} />
		{:else}
			{#each log.args ?? [] as arg}
				<JSONNode value={arg} defaultExpandedLevel={log.expanded ? 1 : 0} />
			{/each}
		{/if}
	</div>

	{#if log.stack && !log.collapsed}
		<div class="trace">
			{#each log.stack?.split('\n').slice(2) ?? '' as stack}
				<div>{stack.replace(/^\s*at\s+/, '')}</div>
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
		display: block;
		position: relative;
		width: 100%;
		text-align: left;
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

	.log > :global(*) {
		margin-right: 10px;
		font-family: var(--sk-font-mono);
	}

	.warn {
		background: hsla(50, 100%, 95%, 0.4);
		border-color: #fff4c4;
	}

	.error {
		background: var(--error-bg);
		border-width: 1px;
		border-color: var(--error-border);
		border-style: solid none;

		& + :global(&) {
			border-top: none;
		}
	}

	.group {
		font-weight: 700;
	}

	.group,
	.arrow {
		cursor: pointer;
		user-select: none;
	}

	.trace {
		border-bottom: 1px solid #eee;
		font-size: 12px;
		font-family: var(--sk-font-mono);
		padding: 0 0 0.4rem calc(1em + var(--indent));
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

	.info {
		color: var(--sk-text-2, #666);
		font-family: var(--sk-font) !important;
		font-size: 12px;
	}

	.error {
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

	.title {
		font-family: var(--sk-font-mono);
		font-size: 13px;
		font-weight: bold;
		padding-left: 11px;
		height: 19px;
	}
</style>
