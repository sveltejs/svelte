<script>
	let thisBug;
</script>

<form bind:this={thisBug}>
	{#snippet Bug()}
		cool
	{/snippet}
</form>

{typeof thisBug}
