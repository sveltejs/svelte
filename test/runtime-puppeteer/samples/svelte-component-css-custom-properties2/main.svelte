<script>
	import Slider1 from './Slider1.svelte';
	import Slider2 from './Slider2.svelte';
	export let componentName = 'Slider1';
	$: slider = componentName === 'Slider1' ? Slider1 : componentName === 'Slider2' ? Slider2 : undefined;
</script>

<section>
	<svelte:component
		this={slider}
		id="component1"
		--rail-color="rgb(0, 0, 0)"
		--track-color="rgb(255, 0, 0)"
	/>

	<svelte:component
		this={slider}
		id="component2"
		--rail-color="rgb(0, 255, 0)"
		--track-color="rgb(0, 0, 255)"
	/>
</section>
