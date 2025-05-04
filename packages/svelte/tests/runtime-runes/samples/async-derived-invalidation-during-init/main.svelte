<script>
	import Child from './Child.svelte';

	let d1 = $state(Promise.withResolvers());
	let d2 = $state(Promise.withResolvers());

	let deferred = $state.raw(d1);
</script>

<button onclick={() => deferred = d2}>switch to d2</button>
<button onclick={() => d1.resolve('one')}>resolve d1</button>
<button onclick={() => d2.resolve('two')}>resolve d2</button>

<svelte:boundary>
	<Child promise={deferred.promise} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
