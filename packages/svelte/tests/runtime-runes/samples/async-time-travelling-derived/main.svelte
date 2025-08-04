<script>
	let object = $state(null);
	let count = $state(0);

	const condition = $derived(object === null);
</script>

<svelte:boundary>
	<button onclick={() => (object = null)}>a</button>
	<button onclick={() => (object = {})}>b</button>

	<button onclick={async () => {
		count++;
		await Promise.resolve();
		object = {};
	}}>{await count}</button>

	{#if condition}
		<h1>a</h1>
	{:else}
		<h1>b</h1>
	{/if}

	{#snippet pending()}{/snippet}
</svelte:boundary>

