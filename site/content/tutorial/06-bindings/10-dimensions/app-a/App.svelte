<script>
	let w;
	let h;
	let size = 42;
	let text = 'edit me';
</script>

<style>
	input { display: block; }
	div { display: inline-block; }
</style>

<input type=range bind:value={size}>
<input bind:value={text}>

<p>size: {w}px x {h}px</p>

<div>
	<span style="font-size: {size}px">{text}</span>
</div>