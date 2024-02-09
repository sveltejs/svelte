<script>
	let foo = typeof window === 'undefined' ? '' : 'x';
</script>

{#if true}
	{foo}
{/if}
