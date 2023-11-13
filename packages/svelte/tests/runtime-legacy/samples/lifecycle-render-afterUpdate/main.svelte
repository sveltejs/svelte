<script>
	import { onMount, afterUpdate } from 'svelte';
	
	let hue = 0;
	let show_hue = false;
	let canvas;
	let ctx;

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	afterUpdate(() => {
		if (canvas !== null) {
			ctx.fillStyle = `hsl(${hue}, 100%, 40%)`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	});
</script>

<canvas bind:this={canvas} on:click={() => hue += 10} />
<div class="info">
	<p>click the canvas</p>
	<label>
		<input type="checkbox" bind:checked={show_hue}> show hue
	</label>
	{#if show_hue}
		<p>hue is {hue}</p>
	{/if}
</div>

<style>
	canvas {
		width: 100%;
		height: 100%;
		background-color: #ddd;
	}

	.info {
		position: fixed;
		top: 1em;
		left: 2em;
		color: white;
	}
</style>