<script>
	/** @type {{message?: import('svelte').Snippet, extra?: import('svelte').Snippet<[any]>, [key: string]: any}} */
	let { ...props } = $props();
	let showMessage = props.message;
	let extraTitle = $derived(props.extra);
</script>

{#if showMessage}
	{@render props.message?.()}
{/if}

{props}