<script>
	export let thePromise;
</script>

{#await thePromise}
	<p>loading...</p>
{:finally}
	<p>finally</p>
{/await}
