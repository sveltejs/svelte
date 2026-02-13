<script>
	let count = $state(0);
</script>

<button onclick={() => count += 1}>
	increment
</button>

<svelte:boundary>
	{#if count % 2}
		<p>{await new Promise(() => {})}</p>
	{:else}
		<p>{await count}</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
