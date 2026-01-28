<script module>
	const message = 'hello';

	export { one };
</script>

{#snippet one()}
	{@render two()}
{/snippet}

{#snippet two()}
	{message}
{/snippet}
