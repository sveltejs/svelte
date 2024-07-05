<script>
	export let thePromise;
</script>

{#await thePromise}
	<p>loading...</p>
{:then theValue}
	<p>the value is {theValue}</p>
{:finally}
	<p>finally</p>
{/await}
