<script>
	import Square from './Square.svelte';
</script>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>

<svg viewBox="0 0 100 100">
	<Square cx={50} cy={50} size={40} style="fill: #ff3e00"/>
</svg>