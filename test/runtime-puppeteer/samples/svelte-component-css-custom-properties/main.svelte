<script>
	import Slider from './Slider.svelte';
</script>

<svelte:component
	this={Slider}
	id="slider-1"
	--rail-color="rgb(0, 0, 0)"
	--track-color="rgb(255, 0, 0)"
/>

<svelte:component
	this={Slider}
	id="slider-2"
	--rail-color="rgb(0, 255, 0)"
	--track-color="rgb(0, 0, 255)"
/>
