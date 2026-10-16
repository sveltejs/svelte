<script>
	let { browser } = $props();
</script>

<svelte:boundary>
	{#if browser}{JSON.parse('')}{/if}
	{#snippet failed()}<p>failed</p>{/snippet}
</svelte:boundary>
<button onclick={(event) => event.currentTarget.textContent = 'clicked'}>log</button>
