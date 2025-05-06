<script>
	import { mount, onMount, tick, unmount } from 'svelte';
	import Icon from './Icon.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let {
		/** @type import('./public.d.ts').ResolvedConfig */
		config
	} = $props();
	let open = $state(true); // todo change this to false

	/** @type {SvelteMap<string, Record<string, any>>} */
	let active_tools = $state(new SvelteMap());
	/** @type {HTMLElement} */
	let toolbar;
	/** @type {HTMLElement} */
	let toolbarPanels;

	let dragOffsetX = 0;
	let dragOffsetY = 0;

	onMount(() => {
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
			tool.activate();
		} else {
			const mounted_component = active_tools.get(tool.name);
			if (tool.component && mounted_component) unmountTool(mounted_component, tool.name);

			tool.deactivate();
			active_tools.delete(tool.name);
		}
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

		// need to wait here, so that the toolbar can close first
		await tick();

		recalculate_toolbar_panel_position();
	}

	function recalculate_toolbar_panel_position() {
		const rect = toolbar.getBoundingClientRect();
		toolbarPanels.style.right = toolbar.style.right;
		toolbarPanels.style.bottom = parseFloat(toolbar.style.bottom ?? 0) + rect.height + 'px';
	}
</script>

<svelte:window onresize={recalculate_toolbar_panel_position} />

<div
	class="toolbar"
	bind:this={toolbar}
	draggable="true"
	ondrag={drag}
	ondragstart={drag_start}
	role="toolbar"
	tabindex="-1"
>
	{#if open}
		<ul class="tools">
			{#each config.tools as tool}
				<li class:active={active_tools.has(tool.name)}>
					<button onclick={() => toggle_tool(tool)} aria-label={tool.name}>{@html tool.icon}</button
					>
				</li>
			{/each}
		</ul>
	{/if}
	<button type="button" class="toolbar-selector" onclick={toggle_toolbar}>
		<Icon />
	</button>
</div>
<div class="toolbar-panels" bind:this={toolbarPanels}></div>

<style>
	.toolbar-selector {
		cursor: pointer;
	}

	.toolbar-selector :global(svg) {
		width: 50px;
		height: 50px;
	}

	.tools {
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
		height: 50px;
		width: 50px;
	}

	.tools li.active {
		border-color: #ff3e00;
	}

	.tools li button {
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.tools li button :global(svg) {
		height: 30px;
		width: 30px;
	}

	.toolbar {
		display: inline-flex;
		background-color: #666; /* TODO: consider dark / light mode */
		color: white;
		position: fixed;
		right: 0;
		bottom: 0;
	}

	.toolbar-panels {
		position: fixed;
		background-color: #999;
		right: 0;
		bottom: 0;
		display: flex;
	}
</style>
