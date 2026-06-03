<script>
	let array = $state(['a', 'b', 'c'])
</script>

{#snippet content([x])}
	{x}
{/snippet}

{@render content(array)}