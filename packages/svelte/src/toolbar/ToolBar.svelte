<script>
	import { mount, onMount, tick, unmount } from 'svelte';
	import Icon from './Icon.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let {
		/** @type import('./public.d.ts').ResolvedConfig */
		config
	} = $props();
	let open = $state(false); // Default to closed

	/** @type {SvelteMap<string, Record<string, any>>} */
	let active_tools = $state(new SvelteMap());
	/** @type {HTMLElement} */
	let toolbar;
	/** @type {HTMLElement} */
	let toolbarPanels;

	let dragOffsetX = 0;
	let dragOffsetY = 0;

	onMount(() => {
		toolbar.style.right = '20px';
		toolbar.style.bottom = '20px';
		recalculate_toolbar_panel_position();
	});

	/**
	 * @param {import('./public').Tool} tool
	 */
	function toggle_tool(tool) {
		const active = active_tools.has(tool.name);
		if (!active) {
			let mounted_component;
			if (tool.component) mounted_component = mountTool(tool.component, tool.name, { tool });

			active_tools.set(tool.name, mounted_component);
			if (tool.activate) tool.activate();
		} else {
			const mounted_component = active_tools.get(tool.name);
			if (tool.component && mounted_component) unmountTool(mounted_component, tool.name);

			if (tool.deactivate) tool.deactivate();
			active_tools.delete(tool.name);
		}

		if (active_tools.size === 0) toolbarPanels.style.display = 'none';
		else toolbarPanels.style.display = 'block';
	}

	/**
	 * @param {import('svelte').Component} component
	 * @param {string} id
	 * @param {Record<string, any>} props
	 */
	function mountTool(component, id, props) {
		if (document.getElementById(id) != null) {
			throw Error(`${id} already exists, skipping`);
		}

		const el = document.createElement('div');
		el.setAttribute('id', `svelte-toolbar-${id}`);
		toolbarPanels.appendChild(el);
		const mounted_component = mount(component, { target: el, props });

		return mounted_component;
	}

	/**
	 * @param {string} id
	 * @param {Record<string, any>} component
	 */
	async function unmountTool(component, id) {
		await unmount(component);

		const el = document.getElementById(`svelte-toolbar-${id}`);
		if (el) el.remove();
	}

	/**
	 * @param {DragEvent} event
	 */
	function drag_start(event) {
		const rect = toolbar.getBoundingClientRect();
		dragOffsetX = event.clientX - rect.x;
		dragOffsetY = event.clientY - rect.y;
	}

	/**
	 * @param {DragEvent} event
	 */
	function drag(event) {
		if (event.clientX === 0 || event.clientY === 0) return;

		const rect = toolbar.getBoundingClientRect();

		const x = window.innerWidth - event.clientX + dragOffsetX - rect.width;
		const y = window.innerHeight - event.clientY + dragOffsetY - rect.height;
		toolbar.style.right = x + 'px';
		toolbar.style.bottom = y + 'px';

		recalculate_toolbar_panel_position();
	}

	async function toggle_toolbar() {
		open = !open;
		await tick();
		recalculate_toolbar_panel_position();
	}

	function recalculate_toolbar_panel_position() {
		const rect = toolbar.getBoundingClientRect();
		toolbarPanels.style.right = toolbar.style.right;
		toolbarPanels.style.bottom = parseFloat(toolbar.style.bottom ?? 0) + rect.height + 10 + 'px'; // Add a small gap
	}
</script>

<svelte:window onresize={recalculate_toolbar_panel_position} />

<div
	class="svelte-toolbar"
	bind:this={toolbar}
	draggable="true"
	ondrag={drag}
	ondragstart={drag_start}
	role="toolbar"
	tabindex="-1"
>
	{#if open}
		<ul class="svelte-toolbar-tools">
			{#each config.tools as tool}
				<li class:active={active_tools.has(tool.name)}>
					<button onclick={() => toggle_tool(tool)} aria-label={tool.name}>{@html tool.icon}</button
					>
				</li>
			{/each}
		</ul>
	{/if}
	<button type="button" class="svelte-toolbar-selector" onclick={toggle_toolbar}>
		<Icon />
	</button>
</div>
<div class="svelte-toolbar-panels" bind:this={toolbarPanels}></div>

<style>
	.svelte-toolbar {
		display: inline-flex;
		background-color: var(--toolbar-background);
		color: var(--toolbar-color);
		position: fixed;
		z-index: 1000;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		padding: 8px;
	}

	.svelte-toolbar-selector {
		cursor: pointer;
		background: none;
		border: none;
		padding: 8px;
		border-radius: 6px;
		transition: background-color 0.2s ease-in-out;
	}

	.svelte-toolbar-selector:hover {
		background-color: var(--toolbar-selector-hover-background);
	}

	.svelte-toolbar-selector :global(svg) {
		width: 24px;
		height: 24px;
		fill: var(--toolbar-icon-color);
	}

	.svelte-toolbar-tools {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
	}

	.svelte-toolbar-tools li {
		display: inline-block;
		margin: 0 4px;
	}

	.svelte-toolbar-tools li button {
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: none;
		background-color: var(--tool-button-background);
		color: var(--tool-button-color);
		cursor: pointer;
		transition:
			background-color 0.2s ease-in-out,
			border-color 0.2s ease-in-out;
	}

	.svelte-toolbar-tools li button:hover {
		background-color: var(--tool-button-hover-background);
	}

	.svelte-toolbar-tools li.active button {
		border: 2px solid var(--accent-color);
	}

	.svelte-toolbar-tools li :global(svg) {
		filter: grayscale(100%);
	}

	.svelte-toolbar-tools li.active :global(svg) {
		filter: unset;
	}

	.svelte-toolbar-tools li button :global(svg) {
		height: 20px;
		width: 20px;
		fill: var(--tool-icon-color);
	}

	.svelte-toolbar-panels {
		position: fixed;
		z-index: 999;
		background-color: var(--panel-background);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		padding: 16px;
		display: none;
		flex-direction: column;
		gap: 8px;
		color: var(--toolbar-color);
	}

	:root {
		--toolbar-background: #f0f0f0;
		--toolbar-color: #222;
		--toolbar-selector-hover-background: #e0e0e0;
		--toolbar-icon-color: #333;
		--tool-button-background: #fff;
		--tool-button-color: #333;
		--tool-button-hover-background: #eee;
		--tool-icon-color: #333;
		--accent-color: #ff3e00;
		--panel-background: #fff;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--toolbar-background: #1e1e27;
			--toolbar-color: white;
			--toolbar-selector-hover-background: #333344;
			--toolbar-icon-color: #d4d4d8;
			--tool-button-background: #333344;
			--tool-button-color: #d4d4d8;
			--tool-button-hover-background: #444;
			--tool-icon-color: #d4d4d8;
			--accent-color: #ff3e00;
			--panel-background: #252531;
		}
	}
</style>
