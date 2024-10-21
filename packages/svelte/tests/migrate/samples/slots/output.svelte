<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('svelte').Snippet<[any]>} [foo]
	 * @property {import('svelte').Snippet} [bar]
	 */

	/** @type {Props} */
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