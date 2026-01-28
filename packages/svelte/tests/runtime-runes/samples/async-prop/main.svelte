<script>
	import Child from './Child.svelte';

	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('hello')}>hello</button>
<button onclick={() => deferred.resolve('hello again')}>again</button>

<svelte:boundary>
	<Child value={await deferred.promise} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
