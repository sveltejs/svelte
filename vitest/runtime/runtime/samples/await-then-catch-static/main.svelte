<script>
	export let promise;
</script>

{#await promise}
	<p>loading...</p>
{:then value}
	<p>loaded</p>
{:catch error}
	<p>errored</p>
{/await}