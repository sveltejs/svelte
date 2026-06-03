<script>
	import { fork } from 'svelte';

	let count = $state(0);

	const resolvers = [];
	let f = null;

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>
<button onclick={async () => {
	f = await fork(() => {
		count += 1;
	});
}}>increment</button>
<button onclick={() => f?.commit()}>commit</button>

<p>count: {count}</p>
<p>eager: {$state.eager(count)}</p>

<svelte:boundary>
	{#if await push(count) % 2 === 0}
		<p>even</p>
	{:else}
		<p>odd</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
