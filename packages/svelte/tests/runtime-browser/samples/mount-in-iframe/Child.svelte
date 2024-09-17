<svelte:options css="injected" />

<script>
	let { count } = $props();
</script>

<h1>count: {count}</h1>

<style>
	h1 {
		color: red;
	}
</style>
