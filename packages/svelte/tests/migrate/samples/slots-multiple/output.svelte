<script>
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<button>{@render children?.()}</button>
<button>{@render children?.()}</button>