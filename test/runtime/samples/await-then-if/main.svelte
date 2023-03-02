<script>
	export let thePromise;
</script>

{#await thePromise}
	loading...
{:then r}
	{#if r.length < 1}
		<p>promise array is empty</p>
	{:else}
		<p>promise array is not empty</p>
	{/if}
{/await}