<script>
	let items = $state(['initial']);
</script>

<svelte:boundary onerror={() => {}}>
	{#await Promise.resolve()}
		{:then}
			<input bind:value={items[0]} />
		{/await}
</svelte:boundary>

<p>Value: {items[0]}</p>