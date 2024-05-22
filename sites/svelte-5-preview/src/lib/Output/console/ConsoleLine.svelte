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

{#if log.args && log.command === 'table'}
	<ConsoleTable data={log.args[0]} columns={log.args[1]} />
{/if}

<span class="log console-{log.command}" style="padding-left: {depth * 15}px">
	{#if log.count && log.count > 1}
		<span class="count">{log.count}</span>
	{/if}

	{#if log.command === 'trace' || log.command === 'group'}
		<button on:click={toggle_group_collapse}>
			<span class="arrow" class:expand={!log.collapsed}>{'\u25B6'}</span>
			{#if log.command === 'group'}
				<span class="title">{log.label}</span>
			{/if}
		</button>
	{/if}

	{#if log.command === 'assert'}
		<span class="assert">Assertion failed:</span>
	{/if}

	{#if log.command === 'clear'}
		<span class="info">Console was cleared</span>
	{:else if log.command === 'unclonable'}
		<span class="info error">Message could not be cloned. Open devtools to see it</span>
	{:else if log.command.startsWith('system')}
		{#each log.args ?? [] as arg}
			{arg}
		{/each}
	{:else if log.args && log.command === 'table'}
		<JSONNode value={log.args[0]} />
	{:else}
		{#each log.args ?? [] as arg}
			<JSONNode value={arg} />
		{/each}
	{/if}
	{#each new Array(depth - 1) as _, idx}
		<div class="outline" style="left: {idx * 15 + 15}px"></div>
	{/each}
</span>

{#if log.command === 'group' && !log.collapsed}
	{#each log.logs ?? [] as childLog}
		<svelte:self log={childLog} depth={depth + 1} />
	{/each}
{/if}

{#if log.command === 'trace' && !log.collapsed}
	<div class="trace">
		{#each log.stack?.split('\n').slice(2) ?? '' as stack}
			<div>{stack.replace(/^\s*at\s+/, '')}</div>
		{/each}
	</div>
{/if}

<style>
	.log {
		border-bottom: 0.5px solid var(--sk-back-4);
		padding: 5px 10px 5px;
		display: flex;
		position: relative;
		font-size: 12px;
		font-family: var(--sk-font-mono);
	}

	.log > :global(*) {
		margin-right: 10px;
		font-family: var(--sk-font-mono);
	}

	.console-warn,
	.console-system-warn {
		background: hsla(50, 100%, 95%, 0.4);
		border-color: #fff4c4;
	}

	.console-error,
	.console-assert {
		background: #fff0f0;
		border-color: #fed6d7;
	}

	.console-group,
	.arrow {
		cursor: pointer;
		user-select: none;
	}

	.console-trace,
	.console-assert {
		border-bottom: none;
	}

	.console-assert + .trace {
		background: #fff0f0;
		border-color: #fed6d7;
	}

	.trace {
		border-bottom: 1px solid #eee;
		font-size: 12px;
		font-family: var(--sk-font-mono);
		padding: 4px 0 2px;
	}

	.trace > :global(div) {
		margin-left: 15px;
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
		top: 0.2rem;
		line-height: 1;
	}

	.info {
		color: var(--sk-text-2, #666);
		font-family: var(--sk-font) !important;
		font-size: 12px;
	}

	.error {
		color: #da106e; /* todo make this a var */
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
		transform: translateY(1px);
	}

	.arrow.expand {
		transform: translateY(1px) rotateZ(90deg);
	}

	.title {
		font-family: var(--sk-font-mono);
		font-size: 13px;
		font-weight: bold;
		padding-left: 11px;
		height: 19px;
	}

	.assert {
		color: #da106e;
	}
</style>
