<script>
	await 0;
	const condition = await true;
</script>

{#if condition}
	<p>yep</p>
{:else}
	<p>nope</p>
{/if}
