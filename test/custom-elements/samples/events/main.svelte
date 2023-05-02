<svelte:options customElement="custom-element" />

<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch("custom", "foo")}>bubble click</button>
