<script>
	let promise;
</script>

{#await promise then data}
	<p>Data: {data}</p>
{/await}
