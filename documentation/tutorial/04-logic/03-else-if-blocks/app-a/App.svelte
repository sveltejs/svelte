<script>
	let x = 7;
</script>

{#if x > 10}
	<p>{x} is greater than 10</p>
{:else}
	<p>{x} is between 0 and 10</p>
{/if}
