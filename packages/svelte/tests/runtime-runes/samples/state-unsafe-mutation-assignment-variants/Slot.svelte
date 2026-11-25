<script lang="ts">
	let { spread = false } = $props();
	let value = $state(0);
</script>

{#if spread}
	<slot {...(value = 1, { value })} />
{:else}
	<slot value={value = 1} />
{/if}
