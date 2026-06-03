<script>
	import Child from './Child.svelte';

	let num = $state(1);
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve(42)}>a</button>
<button onclick={() => deferred.resolve(43)}>b</button>
<button onclick={() => num += 1}>increment</button>

<svelte:boundary>
	<Child promise={deferred.promise} {num} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>

{console.log(`outside boundary ${num}`)}
