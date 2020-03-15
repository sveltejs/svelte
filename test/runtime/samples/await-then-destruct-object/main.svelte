<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then { result, error }}
	<p>error: {error}</p>
	<p>result: {result}</p>
{:catch { error: { message, code } }}
	<p>message: {message}</p>
	<p>code: {code}</p>
{/await}