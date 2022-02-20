<script>
	let backgroundOpacity = 0.5;
	$: color = backgroundOpacity < 0.6 ? '#000' : '#fff';
</script>

<input type="range" min="0" max="1" step="0.1" bind:value={backgroundOpacity} />

<p style:color style:--o={backgroundOpacity}>This is a paragraph.</p>

<style>
	p {
		font-family: "Comic Sans MS", cursive;
		background: rgba(255, 62, 0, var(--o));
	}
</style>
