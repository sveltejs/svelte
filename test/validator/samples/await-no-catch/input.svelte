<script>
	let promise;
</script>

{#await promise}
	<p>Loading</p>
{:then data}
	<p>Data: {data}</p>
{/await}
