<script>
	import Svg from './Svg.svelte';
	export let rectColor1;
	export let rectColor2;
	export let circleColor1;
	export let circleColor2;

	function identity(color) {
		return color;
	}
</script>

<svg xmlns="http://www.w3.org/2000/svg">
	<Svg
		id="svg-1"
		--rect-color={rectColor1}
		--circle-color={circleColor1}
	/>

	<Svg
		id="svg-2"
		--rect-color={rectColor2}
		--circle-color={identity(circleColor2)}
	/>
</svg>