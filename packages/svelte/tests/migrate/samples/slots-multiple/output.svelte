<script>
	/** @type {{children?: import('svelte').Snippet, dashed_name?: import('svelte').Snippet}} */
	let { children, dashed_name } = $props();
</script>

<button>{@render children?.()}</button>
<button>{@render children?.()}</button>

{@render dashed_name?.()}
{@render dashed_name?.()}