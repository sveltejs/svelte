<script>
	export let thePromise;
</script>

{#await thePromise}
	Waiting...
{:then { func }}
	{(() => func)()}
{:catch { func: func_1 }}
	{(() => func_1)()}
{/await}
