<script>
	import Slider from './Slider.svelte';
	export let railColor1;
	export let railColor2;
	export let trackColor1;
	export let trackColor2;

	function identity(color) {
		return color;
	}
</script>

<svelte:component
	this={Slider}
	id="slider-1"
	--rail-color={railColor1}
	--track-color={trackColor1}
/>

<svelte:component
	this={Slider}
	id="slider-2"
	--rail-color={railColor2}
	--track-color={identity(trackColor2)}
/>
