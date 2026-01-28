<svelte:options customElement="custom-element" />

<script>
	export let count = 0;
</script>

<button onclick={() => count++}>{count}</button>
