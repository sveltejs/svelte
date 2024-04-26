<script>
	let { children, foo } = $props();
</script>

<button>{@render children?.()}</button>

{#if foo}
	{@render foo?.({ foo, })}
{/if}