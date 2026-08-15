<script>
	let { children, header } = $props();
</script>

{#if header}<h1>{@render header()}</h1>{/if}
{@render children?.()}
