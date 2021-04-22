<script>
	import { interpolateString as interpolate } from 'd3-interpolate';
	import { tweened } from 'svelte/motion';

	import Grid from './Grid.svelte';
	import Controls from './Controls.svelte';

	import { eases, types } from './eases.js';

	let current_type = 'In';
	let current_ease = 'sine';
	let duration = 2000;
	let current = eases.get(current_ease)[current_type];
	let playing = false;
	let width;

	const ease_path = tweened(current.shape, { interpolate });
	const time = tweened(0);
	const value = tweened(1000);

	async function runAnimations() {
		playing = true;

		value.set(1000, {duration: 0});
		time.set(0, {duration: 0});

		await ease_path.set(current.shape);
		await Promise.all([
			time.set(1000, {duration, easing: x => x}),
			value.set(0, {duration, easing: current.fn})
		]);

		playing = false;
	}

	$: current = eases.get(current_ease)[current_type];
	$: current && runAnimations();
</script>

<div bind:offsetWidth={width} class="easing-vis">
	<svg viewBox="0 0 1400 1802">
		<g class="canvas">
			<Grid x={$time} y={$value}/>
			<g class="graph">
				<path
					d={$ease_path}
					stroke="#333"
					stroke-width="2"
					fill="none"
				/>

				<path d="M0,23.647C0,22.41 27.014,0.407 28.496,0.025C29.978,-0.357 69.188,3.744 70.104,4.744C71.02,5.745 71.02,41.499 70.104,42.5C69.188,43.501 29.978,47.601 28.496,47.219C27.014,46.837 0,24.884 0,23.647Z"
					fill="#ff3e00"
					style="transform: translate(1060px, {($value - 24)}px)"
				/>

				<circle
					cx="{$time}"
					cy="{$value}"
					r="15"
					fill="#ff3e00"
				/>
			</g>
		</g>
	</svg>

	<Controls
		{eases}
		{types}
		{playing}
		{width}
		bind:duration
		bind:current_ease
		bind:current_type
		on:play={runAnimations}
	/>
</div>

<style>
	.easing-vis {
		display: flex;
		max-height: 95%;
		max-width: 800px;
		margin: auto;
		padding: 10px;
		border: 1px solid #333;
		border-radius: 2px;
		padding: 20px;
	}

	svg {
		width: 100%;
		margin: 0 20px 0 0;
	}

	.graph {
		transform: translate(200px,400px)
	}

	@media (max-width:600px) {
		.easing-vis {
			flex-direction: column;
			max-height: calc(100% - 3rem);
		}
	}
</style>