<script>
	export let items = [
		{
			title: 'a title',
			data: new Promise((f) => {
				f(42);
			}),
		},
	]
</script>

{#each items as item}
	{#await item.data}
		<p>{item.title}: loading...</p>
	{:then result}
		<p>{item.title}: {result}</p>
	{/await}
{/each}