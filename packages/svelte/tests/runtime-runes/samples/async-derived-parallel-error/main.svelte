<script lang="ts">
	import Child from './Child.svelte';

	const settlers = new Map<string, () => void>();

	function load(name: string) {
		const { promise, resolve, reject } = Promise.withResolvers<string>();
		settlers.set(`resolve ${name}`, () => resolve(name));
		settlers.set(`reject ${name}`, () => reject(new Error(`${name} failed`)));
		return promise;
	}
</script>

{#each ['resolve a', 'reject b'] as name}
	<button onclick={() => settlers.get(name)?.()}>{name}</button>
{/each}

<svelte:boundary>
	<Child {load} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}

	{#snippet failed(error)}
		<output>{(error as Error).message}</output>
	{/snippet}
</svelte:boundary>
