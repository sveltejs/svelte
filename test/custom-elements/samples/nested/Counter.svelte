<svelte:options tag="my-counter" />

<script>
	export let count = 0;
</script>

<slot />
<button on:click={() => (count += 1)}>count: {count}</button>

<style>
	button {
		color: red;
	}
</style>
