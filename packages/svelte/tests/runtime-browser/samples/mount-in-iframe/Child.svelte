<svelte:options css="injected" />

<script>
	import GrandChild from "./GrandChild.svelte";

	let { count } = $props();
</script>

<h1>count: {count}</h1>
<GrandChild {count} />

<style>
	h1 {
		color: red;
	}
</style>
