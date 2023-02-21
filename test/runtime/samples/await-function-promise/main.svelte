<script>
	export let promise;
</script>

{#await promise then value}
	<p>{JSON.stringify(value)}</p>
{/await}
