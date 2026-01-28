<script>
	const wrapperWidth = 960;
	const wrapperHeight = 720;
	const cellSize = 10;
	const centerX = wrapperWidth / 2;
	const centerY = wrapperHeight / 2;

	let angle = 0;
	let radius = 0;

	let tiles = [];
	const step = cellSize;

	while (radius < Math.min(wrapperWidth, wrapperHeight) / 2) {
		let x = centerX + Math.cos(angle) * radius;
		let y = centerY + Math.sin(angle) * radius;

		if (x >= 0 && x <= wrapperWidth - cellSize && y >= 0 && y <= wrapperHeight - cellSize) {
			tiles.push({ x, y });
		}

		angle += 0.2;
		radius += step * 0.015;
	}
</script>

<div id="wrapper">
	{#each tiles as { x, y }}
		<div class="tile" style="left: {x.toFixed(2)}px; top: {y.toFixed(2)}px;"></div>
	{/each}
</div>
