<script>
	let { inner } = $props();
</script>

{#if inner}
	{@render inner()}
{/if}
