<svelte:options customElement="my-counter" />

<script>
	import { getContext } from "svelte";

	export let count = 0;

	const context = getContext("context");
</script>

<slot />
<button on:click={() => (count += 1)}>count: {count}</button>
<p>Context {context}</p>

<style>
	button {
		color: red;
	}
</style>
