<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [message]
	 * @property {import('svelte').Snippet<[any]>} [extra]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { ...props } = $props();
	let showMessage = props.message;
	let extraTitle = $derived(props.extra);
</script>

{#if showMessage}
	{@render props.message?.()}
{/if}

{props}