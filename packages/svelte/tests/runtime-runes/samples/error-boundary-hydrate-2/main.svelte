<script>
	import Child from './child.svelte';

	let recovered = $state(false);
</script>

<svelte:boundary>
	{#if recovered}
		<p>recovered</p>
	{:else}
		<Child />
	{/if}

	{#snippet failed(error, reset)}
		<p>failed: {error}</p>
		<button
			onclick={() => {
				recovered = true;
				reset();
			}}>reset</button>
	{/snippet}
</svelte:boundary>
