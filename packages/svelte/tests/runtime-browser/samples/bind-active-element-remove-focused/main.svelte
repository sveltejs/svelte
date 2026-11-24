<script>
	let activeElement = $state();
	let show = $state(true);
</script>

<svelte:document bind:activeElement />

{#if show}
	<button onclick={() => (show = false)}>hide</button>
{/if}
