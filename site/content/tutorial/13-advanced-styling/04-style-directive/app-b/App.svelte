<script>
	let bgOpacity = 0.5;
	$: color = bgOpacity < 0.6 ? "#000" : "#fff";
</script>

<input type="range" min="0" max="1" step="0.1" bind:value={bgOpacity} />

<p style:color style:--opacity={bgOpacity}>This is a paragraph.</p>

<style>
	p {
		font-family: "Comic Sans MS", cursive;
		background: rgba(255, 62, 0, var(--opacity));
	}
</style>
