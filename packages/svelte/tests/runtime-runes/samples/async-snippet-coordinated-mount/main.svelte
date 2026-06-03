<script>
	import Child from './Child.svelte';
	const resolvers = [];
	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>

<svelte:boundary>
	<Child {push}>
		<p>{await push('hello from parent')}</p>
	</Child>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
