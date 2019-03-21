<script>
	export let width;
	export let height;
</script>

<svelte:window on:resize='{() => width = this.innerWidth, height = this.innerHeight}'/>

<div>{width}x{height}</div>