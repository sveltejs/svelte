<script>
	let { children } = $props();
</script>

<div>Resolving a promise here: {await Promise.resolve('ok')}</div>

<svelte:boundary>
	{#snippet pending()}loading...{/snippet}
	{@render children()}
</svelte:boundary>
