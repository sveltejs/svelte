<script>
	import { onMount, tick } from 'svelte';
	import Icon from './Icon.svelte';

	/** @type {{ config: import('./public.d.ts').ResolvedConfig }} */
	let { config } = $props();
	let open = $state(false);

	/** @type {import('svelte').Component | undefined} */
	let ActiveComponent = $state();
	/** @type {HTMLElement} */
	let toolbarSelector;
	/** @type {HTMLElement} */
	let toolbarPanels;
	/** @type {HTMLElement} */
	let toolbarTools;

	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let toolbarScreenOffset = 20;

	/** @type {import('./public').Config['position']} */
	let computedPosition = config.position;

	onMount(() => {
		computedPosition = config.position;
		layout_selector();
	});

	$effect(() => {
		computedPosition = config.position;
		layout_selector();
		layout_toolbar();
	});

	function layout_selector() {
		const rect = toolbarSelector.getBoundingClientRect();

		let x = 0;
		let y = 0;

		switch (computedPosition) {
			case 'top-left':
				x = toolbarScreenOffset;
				y = toolbarScreenOffset;
				break;

			case 'top-right':
				x = window.innerWidth - rect.width - toolbarScreenOffset;
				y = toolbarScreenOffset;
				break;

			case 'bottom-right':
				x = window.innerWidth - rect.width - toolbarScreenOffset;
				y = window.innerHeight - rect.height - toolbarScreenOffset;
				break;

			case 'bottom-left':
				x = toolbarScreenOffset;
				y = window.innerHeight - rect.height - toolbarScreenOffset;
				break;

			default:
				break;
		}

		toolbarSelector.style.left = x + 'px';
		toolbarSelector.style.top = y + 'px';
	}

	function layout_toolbar() {
		const toolbarSelectorRect = toolbarSelector.getBoundingClientRect();
		const toolbarToolsRect = toolbarTools.getBoundingClientRect();
		const toolbarPanelsRect = toolbarPanels.getBoundingClientRect();

		switch (computedPosition) {
			case 'top-left':
				toolbarTools.style.top = toolbarSelector.style.top;
				toolbarTools.style.left =
					parseFloat(toolbarSelector.style.left) + toolbarSelectorRect.width + 'px';

				toolbarPanels.style.top =
					parseFloat(toolbarSelector.style.top) + toolbarSelectorRect.height + 'px';
				toolbarPanels.style.left = toolbarSelectorRect.x + 'px';
				break;

			case 'top-right':
				toolbarTools.style.top = toolbarSelector.style.top;
				toolbarTools.style.left =
					parseFloat(toolbarSelector.style.left) - toolbarToolsRect.width + 'px';

				toolbarPanels.style.top =
					parseFloat(toolbarSelector.style.top) + toolbarSelectorRect.height + 'px';
				toolbarPanels.style.left =
					parseFloat(toolbarSelector.style.left) -
					toolbarPanelsRect.width +
					toolbarSelectorRect.width +
					'px';
				break;

			case 'bottom-left':
				toolbarTools.style.top = toolbarSelector.style.top;
				toolbarTools.style.left =
					parseFloat(toolbarSelector.style.left) + toolbarSelectorRect.width + 'px';

				toolbarPanels.style.top =
					parseFloat(toolbarSelector.style.top) - toolbarPanelsRect.height + 'px';
				toolbarPanels.style.left = toolbarSelectorRect.x + 'px';
				break;

			case 'bottom-right':
				toolbarTools.style.top = toolbarSelector.style.top;
				toolbarTools.style.left =
					parseFloat(toolbarSelector.style.left) - toolbarToolsRect.width + 'px';

				toolbarPanels.style.top =
					parseFloat(toolbarSelector.style.top) - toolbarPanelsRect.height + 'px';
				toolbarPanels.style.left =
					parseFloat(toolbarSelector.style.left) -
					toolbarPanelsRect.width +
					toolbarSelectorRect.width +
					'px';
				break;

			default:
				break;
		}
	}

	/**
	 * @param {import('./public').Tool} tool
	 */
	async function toggle_tool(tool) {
		if (tool.component === ActiveComponent) {
			ActiveComponent = undefined;
		} else {
			ActiveComponent = tool.component;
		}

		if (!ActiveComponent) toolbarPanels.style.display = 'none';
		else toolbarPanels.style.display = 'block';

		await tick();
		layout_toolbar();
	}

	/**
	 * @param {DragEvent} event
	 */
	function drag_start(event) {
		const rect = toolbarSelector.getBoundingClientRect();
		dragOffsetX = event.clientX - rect.x;
		dragOffsetY = event.clientY - rect.y;
	}

	/**
	 * @param {DragEvent} event
	 */
	function drag(event) {
		if (event.clientX === 0 || event.clientY === 0) return;

		const x = event.clientX - dragOffsetX;
		const y = event.clientY - dragOffsetY;
		toolbarSelector.style.left = x + 'px';
		toolbarSelector.style.top = y + 'px';

		let top = false;
		let left = false;

		if (y < window.innerHeight / 2) top = true;
		if (x < window.innerWidth / 2) left = true;

		if (top && left) computedPosition = 'top-left';
		if (top && !left) computedPosition = 'top-right';
		if (!top && left) computedPosition = 'bottom-left';
		if (!top && !left) computedPosition = 'bottom-right';

		layout_toolbar();
	}

	async function toggle_toolbar() {
		open = !open;
		await tick();
	}
</script>

<svelte:window onresize={layout_toolbar} />

<div class="svelte-toolbar">
	<div
		bind:this={toolbarSelector}
		draggable="true"
		ondrag={drag}
		ondragstart={drag_start}
		role="toolbar"
		tabindex="-1"
		class="svelte-toolbar-selector svelte-toolbar-base"
	>
		<button type="button" onclick={toggle_toolbar}>
			<Icon />
		</button>
	</div>

	<div class="svelte-toolbar-tools svelte-toolbar-base" bind:this={toolbarTools}>
		{#if open}
			<ul>
				{#each config.tools as tool}
					<li class:active={tool.component === ActiveComponent}>
						<button onclick={() => toggle_tool(tool)} aria-label={tool.name}>
							{@html tool.icon}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="svelte-toolbar-panels" bind:this={toolbarPanels}>
		{#if ActiveComponent}
			<ActiveComponent {config} />
		{/if}
	</div>
</div>

<style>
	.svelte-toolbar {
		display: inline-flex;
		background-color: var(--toolbar-background);
		color: var(--toolbar-color);
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.svelte-toolbar-selector {
		position: fixed;
	}

	.svelte-toolbar-selector button {
		cursor: pointer;
	}

	.svelte-toolbar-base {
		border: none;
		border-radius: 6px;
		transition: background-color 0.2s ease-in-out;
		background-color: var(--toolbar-background);
		margin: 0;
		height: var(--toolbar-height);
		display: flex;
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
		position: fixed;
		background-color: var(--toolbar-background);
	}

	.svelte-toolbar-tools ul {
		list-style: none;
		margin: 0;
		padding: 8px;
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

	.svelte-toolbar-selector,
	.svelte-toolbar,
	.svelte-toolbar-panels {
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
		--toolbar-height: 50px;
	}

	@media (prefers-color-scheme: dark) {
		.svelte-toolbar-selector,
		.svelte-toolbar,
		.svelte-toolbar-panels {
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
