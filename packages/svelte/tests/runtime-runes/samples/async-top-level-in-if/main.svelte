<script>
	import Child from './Child.svelte';

	let condition = $state(false);
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => condition = !condition}>toggle</button>
<button onclick={() => deferred.resolve('hello')}>hello</button>

<svelte:boundary>
	{#if condition}
		<p>condition is {condition}</p>
		<Child promise={deferred.promise} />
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
