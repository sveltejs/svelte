<script>
	export let thePromise;

	let count = 0;

	setTimeout(() => {
		count++;
	}, 0);
</script>

{#await thePromise then { result }}
	{#if result}
		<p>result: {result}</p>
		<p>count: {count}</p>
	{:else}
		<p>result: {result}</p>
		<p>count: {count}</p>
	{/if}
{/await}
