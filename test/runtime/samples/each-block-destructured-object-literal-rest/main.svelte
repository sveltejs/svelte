<script>
	export let objectsArray;
</script>

{#each objectsArray as { "quote": quotedProp, "wrong-quote": wrongQuote, 16: sixteen, ...props } }
	<p {...props}>Quote: {quotedProp}, Wrong Quote: {wrongQuote}, 16: {sixteen}</p>
{/each}
