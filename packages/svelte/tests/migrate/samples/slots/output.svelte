<script>
	/** @type {{children?: import('svelte').Snippet, foo_1?: import('svelte').Snippet<[any]>, bar?: import('svelte').Snippet, dashed_name?: import('svelte').Snippet}} */
	let {
		children,
		foo_1,
		bar,
		dashed_name
	} = $props();
</script>

<button>{@render children?.()}</button>

{#if foo}
	{@render foo_1?.({ foo, })}
{/if}

{#if bar}
	{$$slots}
	{@render bar?.()}
{/if}

{@render dashed_name?.()}