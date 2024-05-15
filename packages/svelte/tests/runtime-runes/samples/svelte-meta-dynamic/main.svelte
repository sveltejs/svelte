<script>
	let condition = $state(false);
</script>

<button onclick={() => condition = !condition}>toggle</button>

<svelte:element this={'p'}>before</svelte:element>

{#if condition}
	<svelte:element this={'strong'}>during</svelte:element>
{/if}

<svelte:element this={'p'}>after</svelte:element>
