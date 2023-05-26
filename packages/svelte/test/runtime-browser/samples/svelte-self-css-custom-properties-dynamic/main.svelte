<script>
	import Slider from './Slider.svelte';
	export let railColor1;
	export let railColor2;
	export let trackColor1;
	export let trackColor2;
	export let nestRailColor1;
	export let nestRailColor2;
	export let nestTrackColor1;
	export let nestTrackColor2;

	function identity(color) {
		return color;
	}
</script>

<Slider
	id="slider-1"
	--rail-color={railColor1}
	--track-color={trackColor1}
	railColor1={nestRailColor1}
	trackColor1={nestTrackColor1}
/>

<svelte:component
	this={Slider}
	id="slider-2"
	--rail-color={railColor2}
	--track-color={identity(trackColor2)}
	railColor1={nestRailColor2}
	trackColor1={nestTrackColor2}
/>
