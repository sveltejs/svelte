<script>
	import Child from './Child.svelte';

	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred.resolve('hello')}>hello</button>

<svelte:boundary>
	<Child promise={deferred.promise} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
