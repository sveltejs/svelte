<script>
	let foo = true;
</script>

{#if foo}
	<p>foo!</p>
{:else}
	<p>not foo!</p>
{/if}