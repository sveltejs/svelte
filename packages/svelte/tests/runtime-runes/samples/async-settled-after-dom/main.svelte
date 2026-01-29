<script>
	let text = $state('hello');

	const resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>
<button onclick={() => text = 'goodbye'}>update</button>

<svelte:boundary>
	<p>{await push(text)}</p>

	{#snippet pending()}{/snippet}
</svelte:boundary>
