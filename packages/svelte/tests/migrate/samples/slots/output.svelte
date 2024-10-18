<script>
	/** @type {{children?: import('svelte').Snippet, foo?: import('svelte').Snippet<[any]>, bar?: import('svelte').Snippet}} */
	let { children, foo, bar } = $props();
</script>

<button>{@render children?.()}</button>

{#if foos}
	{@render foo?.({ foo: foos, })}
{/if}

{#if bar}
	{$$slots}
	{@render bar?.()}
{/if}

{#if children}foo{/if}

{#if children}foo{/if}

{@render children?.({ header: "something", title: my_title, id, })}