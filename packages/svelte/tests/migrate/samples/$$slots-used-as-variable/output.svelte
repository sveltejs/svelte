<script>
	/**
	* @typedef {Object} Props
	* @property {import('svelte').Snippet} [message]
	* @property {any} [showMessage]
	* @property {import('svelte').Snippet<[any]>} [title]
	* @property {import('svelte').Snippet<[any]>} [extra]
	*/

	/** @type {Props} */
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