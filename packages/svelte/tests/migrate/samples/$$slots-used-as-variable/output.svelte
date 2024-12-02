<script>
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