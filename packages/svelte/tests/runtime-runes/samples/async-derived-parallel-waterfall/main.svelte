<script lang="ts">
	import Child from './Child.svelte';

	const resolvers = new Map<string, () => void>();

	function load(name: string, ...dependencies: unknown[]) {
		const { promise, resolve } = Promise.withResolvers<string>();
		resolvers.set(name, () => resolve(name));
		return promise;
	}
</script>

{#each ['a', 'b', 'c'] as name}
	<button onclick={() => resolvers.get(name)?.()}>{name}</button>
{/each}

<svelte:boundary>
	<Child {load} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
