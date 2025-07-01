<script>
	let { children, named } = $props();
</script>

{@render children?.()}

{#if true}
	{@render named?.()}
{/if}
