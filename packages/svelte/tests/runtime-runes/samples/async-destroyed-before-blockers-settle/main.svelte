<script>
	import Child from './Child.svelte';

	const deferred = Promise.withResolvers();

	let show = $state(true);
</script>

<button onclick={() => (show = false)}>hide</button>
<button onclick={() => deferred.resolve(1)}>resolve</button>

<svelte:boundary>
	{#if show}
		<Child promise={deferred.promise} />
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
