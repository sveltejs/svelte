<svelte:options accessors/>

<script>
	export let h1;
</script>

<h1 bind:this={h1}>Hello world!</h1>