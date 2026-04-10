<script>
let d = $derived(await Promise.resolve({ data: "data", hasData: true }));
let showFetchCta = $derived(d.hasData)
</script>

{#if d}
	{@const {data, hasData} = d}

	{#if hasData}
		<p>{data}</p>
	{:else if showFetchCta}
		<p>Fetch now</p>
	{:else}
		<p>No data</p>
	{/if}
{/if}
