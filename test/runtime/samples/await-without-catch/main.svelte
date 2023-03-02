<script>
	export let promise;
</script>

{#await promise}
	<p>loading...</p>
{:then value}
	<p>loaded</p>
{/await}