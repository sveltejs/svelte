<script>
	import Child from './Child.svelte';

	let deferred = $state(Promise.withResolvers());
	let num = $state(1);
</script>

<button onclick={() => deferred.resolve('a')}>resolve a</button>
<button onclick={() => deferred.resolve('b')}>resolve b</button>
<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => num += 1}>increment</button>

<svelte:boundary>
	<Child promise={deferred.promise} {num} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>

{console.log(`outside boundary ${num}`)}
