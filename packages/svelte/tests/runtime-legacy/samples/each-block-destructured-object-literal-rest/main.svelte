<script>
	export let objectsArray;
</script>

{#each objectsArray as { "quote": quotedProp, "wrong-quote": wrongQuote, 16: sixteen, [10 + 7]: seventeen, ...props }}
	<p {...props}>Quote: {quotedProp}, Wrong Quote: {wrongQuote}, 16: {sixteen}, 17: {seventeen}</p>
{/each}
