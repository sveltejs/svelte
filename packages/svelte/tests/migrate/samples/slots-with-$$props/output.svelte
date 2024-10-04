<script>
	/** @type {Record<string, any>} */
	let {
		...props
	} = $props();
</script>

<button>{@render props.children?.()}</button>

{#if foo}
	{@render props.foo_1?.({ foo, })}
{/if}

{#if props.bar}
	{$$slots}
	{@render props.bar?.()}
{/if}

{#if props.children}foo{/if}

{#if props.children}foo{/if}

{#if props.dashed_name}foo{/if}

{@render props.dashed_name?.()}

{@render props.children?.({ header: "something", title: props.cool, id, })}