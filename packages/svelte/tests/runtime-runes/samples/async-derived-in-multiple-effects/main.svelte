<script>
	import Component from './Component.svelte';
	let count = $state(0);
	const double = $derived(count * 2);
</script>

<svelte:boundary>
	{await new Promise((r) => {
		// long enough for the test to do all its other stuff while this is pending
		setTimeout(r, 10);
	})}
	{#snippet pending()}{/snippet}
</svelte:boundary>

<button onclick={() => count += 1}>{count}</button>

{#if count > 0}
	<Component {double} />
{/if}
