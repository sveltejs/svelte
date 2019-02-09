<script>
	import { spring } from 'svelte/motion';

	let coords = spring({
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	}, {
		stiffness: 0.1,
		damping: 0.25
	});

	let size = spring(10);

	function follow(e) {
		coords.set({
			x: e.clientX,
			y: e.clientY
		});
	}

	function embiggen() {
		size.set(30);
	}

	function revert() {
		size.set(10);
	}
</script>

<svelte:window
	on:mousemove={follow}
	on:mousedown={embiggen}
	on:mouseup={revert}
/>

<svg>
	<circle cx={$coords.x} cy={$coords.y} r={$size}/>
</svg>

<div class="controls">
	<label>
		<h3>stiffness ({coords.stiffness})</h3>
		<input bind:value={coords.stiffness} type="range" min="0" max="1" step="0.01">
	</label>

	<label>
		<h3>damping ({coords.damping})</h3>
		<input bind:value={coords.damping} type="range" min="0" max="1" step="0.01">
	</label>
</div>

<style>
	:global(body) { padding: 0 }
	svg { width: 100%; height: 100% }
	circle { fill: #ff3e00 }
	.controls { position: absolute; top: 1em; left: 1em }
</style>