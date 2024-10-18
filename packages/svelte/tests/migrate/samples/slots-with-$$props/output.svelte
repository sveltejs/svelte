<script>
	/** @type {{children?: import('svelte').Snippet, foo?: import('svelte').Snippet<[any]>, bar?: import('svelte').Snippet, [key: string]: any}} */
	let { ...props } = $props();
</script>

<button>{@render props.children?.()}</button>

{#if foos}
	{@render props.foo?.({ foo: foos, })}
{/if}

{#if props.bar}
	{$$slots}
	{@render props.bar?.()}
{/if}

{#if props.children}foo{/if}

{#if props.children}foo{/if}

{@render props.children?.({ header: "something", title: props.cool, id, })}