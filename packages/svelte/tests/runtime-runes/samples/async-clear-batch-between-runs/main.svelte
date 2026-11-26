<script>
	import Child from './Child.svelte';

	let x = $state('x1');
	let y = $state('y1');

	const deferred = Promise.withResolvers();
</script>

<button onclick={() => x = 'x2'}>x</button>
<button onclick={() => deferred.resolve('y2')}>y</button>

<svelte:boundary>
	<Child {x} {y} {deferred} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
