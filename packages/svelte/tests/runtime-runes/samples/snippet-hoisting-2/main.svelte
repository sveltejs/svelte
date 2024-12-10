<script>
	let abc = 'a'
</script>

{@render b()}

{#snippet a()}
	{abc}
{/snippet}

{#snippet b()}
	{@render a()}
{/snippet}
