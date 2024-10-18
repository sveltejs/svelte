<script>
	/** @type {{message?: import('svelte').Snippet, showMessage?: any, title?: import('svelte').Snippet<[any]>, extra?: import('svelte').Snippet<[any]>}} */
	let {
		message,
		showMessage = message,
		title,
		extra
	} = $props();

	let showTitle = title;

	let extraTitle = $derived(extra);
</script>

{#if showMessage}
	{@render message?.()}
{/if}