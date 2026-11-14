<script>
	import Child from './Child.svelte';
	import Slow from './Slow.svelte';

	const queue = [];

	function push(v, fail = false) {
		const d = Promise.withResolvers();
		queue.push(() => (fail ? d.reject(new Error(v)) : d.resolve(v)));
		return d.promise;
	}
</script>

<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<svelte:boundary>
	<svelte:boundary>
		<Slow {push} />
		<Child {push} />

		{#snippet failed(e)}
			<p>failed: {e.message}</p>
		{/snippet}
	</svelte:boundary>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
