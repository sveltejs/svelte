<script>
	let promise;
</script>

{#await promise catch error}
	<p>Error: {error}</p>
{/await}
