<script>
	let { children, foo_1, dashed_name } = $props();
</script>

<button>{@render children?.()}</button>

{#if foo}
	{@render foo_1?.({ foo, })}
{/if}

{@render dashed_name?.()}