<script>
	import Slider1 from './Slider1.svelte';
	import Slider2 from './Slider2.svelte';
</script>

<Slider1
	id="component1"
	--rail-color="rgb(0, 0, 0)"
	--track-color="rgb(255, 0, 0)"
/>

<Slider2
	id="component2"
	--rail-color="rgb(0, 255, 0)"
	--track-color="rgb(0, 0, 255)"
/>
