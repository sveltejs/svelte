<script>
	import Component from "./Component.svelte"
	let shown = $state(false);
</script>

{#if shown}
	Nothing
{:else}
	<svelte:component this={Component} />
{/if}

