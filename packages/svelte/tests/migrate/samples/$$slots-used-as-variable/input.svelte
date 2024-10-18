<script>
	export let showMessage = $$slots.message;

	let showTitle = $$slots.title;

	$: extraTitle = $$slots.extra;
</script>

{#if showMessage}
	<slot name="message" />
{/if}
