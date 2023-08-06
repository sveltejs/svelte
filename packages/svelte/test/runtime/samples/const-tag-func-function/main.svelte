<script>
	const func = 100;
</script>

{#if true}
	{@const [func_1] = [[12, 13, 14]]}
	{(() => JSON.stringify(func_1))()}
{/if}
