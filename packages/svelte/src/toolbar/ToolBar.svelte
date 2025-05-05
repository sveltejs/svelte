<script>
	import { draggable } from '@neodrag/svelte';
	import Icon from './Icon.svelte';
	import { configure, getConfig } from 'svelte/toolbar';

	let open = $state(true); // todo change this to false

	configure({
		tools: [
			{ name: 'state' },
			{
				name: 'inspector',
				activate: () => {
					console.log('inspector activated');
				}
			},
			{ name: 'a11y' },
			{ name: 'config' }
		]
	});

	let config = getConfig();
	/** @type {string[]} */
	let active_tool_names = $state([]);

	/**
	 * @param {import('./public').Tool} tool
	 */
	function toggle_tool(tool) {
		const active = active_tool_names.includes(tool.name);
		if (!active) {
			active_tool_names.push(tool.name);
			tool.activate();
		} else {
			active_tool_names.splice(active_tool_names.indexOf(tool.name), 1);
			tool.deactivate();
		}

		console.log(active_tool_names);
	}
</script>

<div class="toolbar" use:draggable={{ bounds: document.body }}>
	{#if open}
		<ul class="tools">
			{#each config.tools as tool}
				<li class:active={active_tool_names.includes(tool.name)}>
					<button onclick={() => toggle_tool(tool)}>{tool.name}</button>
				</li>
			{/each}
		</ul>
	{/if}
	<button type="button" class="toolbar-selector" onclick={() => (open = !open)}>
		<Icon />
	</button>
</div>

<style>
	.toolbar-selector {
		cursor: pointer;
	}

	.toolbar-selector :global(svg) {
		width: 50px;
		height: 50px;
	}

	.tools {
		background-color: #666; /* TODO: consider dark / light mode */
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
	}

	.tools li {
		display: inline-block;
		background-color: #444;
		border: #111 1px solid;
		border-radius: 50%;
		margin: 0 10px;
		padding: 10px;
		height: 30px;
	}

	.tools li.active {
		border-color: #ff3e00;
	}

	.toolbar {
		display: inline-flex;
		color: white;
		position: static;
	}

	.toolbar > * {
		/* display: inline-block; */
	}
</style>
