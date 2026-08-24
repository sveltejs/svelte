<script>
	import Child from './child.svelte';

	let recovered = $state(false);
	let reset_fn = $state();
</script>

<svelte:boundary
	onerror={(error, reset) => {
		console.log(`onerror: ${error}`);
		reset_fn = reset;
	}}
>
	{#if recovered}
		<p>recovered</p>
	{:else}
		<Child />
	{/if}

	{#snippet failed(error)}
		<p>failed: {error}</p>
	{/snippet}
</svelte:boundary>

<button
	onclick={() => {
		recovered = true;
		reset_fn();
	}}>reset</button>
