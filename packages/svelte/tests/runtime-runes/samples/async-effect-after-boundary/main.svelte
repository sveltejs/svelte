<script>
	import Child from './Child.svelte';

	let resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push('hello')}</p>
	<Child />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
