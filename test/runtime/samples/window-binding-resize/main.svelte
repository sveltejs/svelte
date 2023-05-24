<script>
	export let width;
	export let height;
	export let devicePixelRatio;
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} bind:devicePixelRatio={devicePixelRatio}/>

<div>{width}x{height}</div>
<div>{devicePixelRatio}</div>
