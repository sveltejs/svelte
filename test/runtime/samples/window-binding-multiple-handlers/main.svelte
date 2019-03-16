<script>
	export let width;
	export let height;
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>
<button on:click={() => {}}>Click</button>
