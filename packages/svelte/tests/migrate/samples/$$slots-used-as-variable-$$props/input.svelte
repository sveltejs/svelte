<script>
	let showMessage = $$slots.message;
	$: extraTitle = $$slots.extra;
</script>

{#if showMessage}
	<slot name="message" />
{/if}

{$$props}