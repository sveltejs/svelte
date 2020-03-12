<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then { result, error }}
	{#if error}
		<p>error: { error }</p>
	{:else}
		<p>result: {result}</p>
	{/if}
{/await}