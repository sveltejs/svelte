<script>
	let { children } = $props();
</script>

<div>Resolving a promise here: {await Promise.resolve('ok')}</div>

<svelte:boundary>
	{@render children?.()}

	{#snippet pending()}
		loading...
	{/snippet}
</svelte:boundary>
