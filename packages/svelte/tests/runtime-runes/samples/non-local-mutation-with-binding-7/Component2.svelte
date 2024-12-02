<script>
	let { rows = $bindable([]) } = $props();
</script>

{#if rows.length}
	<input type="checkbox" bind:checked={rows[0].check} />
{/if}
