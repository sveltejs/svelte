<script>
	import { tick } from 'svelte';

	export let html = '';
	export let x = 0;
	export let y = 0;

	let width = 1;
	let tooltip;

	// bit of a gross hack but it works — this prevents the
	// tooltip from disappearing off the side of the screen
	$: if (html && tooltip) {
		tick().then(() => {
			width = tooltip.getBoundingClientRect().width;
		});
	}
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	on:mouseenter
	on:mouseleave
	class="tooltip-container"
	style="left: {x}px; top: {y}px; --offset: {Math.min(-10, window.innerWidth - (x + width + 10))}px"
>
	<div bind:this={tooltip} class="tooltip">
		<span>{@html html}</span>
	</div>
</div>

<style>
	.tooltip-container {
		--bg: var(--sk-theme-2);
		--arrow-size: 0.4rem;
		position: absolute;
		transform: translate(var(--offset), calc(2rem + var(--arrow-size)));
	}

	.tooltip {
		margin: 0 2rem 0 0;
		background-color: var(--bg);
		color: #fff;
		text-align: left;
		padding: 0.4rem 0.6rem;
		border-radius: var(--sk-border-radius);
		font-family: var(--sk-font-mono);
		font-size: 1.2rem;
		white-space: pre-wrap;
		z-index: 100;
		filter: drop-shadow(2px 4px 6px #67677866);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		left: calc(-1 * var(--offset) - var(--arrow-size));
		top: calc(-2 * var(--arrow-size));
		border: var(--arrow-size) solid transparent;
		border-bottom-color: var(--bg);
	}

	.tooltip :global(a) {
		color: white;
		text-decoration: underline;
	}
</style>
