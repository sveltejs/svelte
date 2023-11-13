<script>
	export let width;
	export let height;
</script>

<svelte:window on:resize={function () {
	// TODO for some reason this.innerWidth doesn't work as the this context is not the window object during test
	width = window.innerWidth, height = window.innerHeight;
}}/>

<div>{width}x{height}</div>