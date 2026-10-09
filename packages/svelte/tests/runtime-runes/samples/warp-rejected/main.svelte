<script lang="ts">
	import { Warp } from 'svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, Promise<string>>('app');
	const data = warp.getOrInsertComputed(
		'data',
		() => new Promise((_, reject) => setTimeout(() => reject(new Error(`from ${environment}`))))
	);
</script>

<svelte:boundary>
	<p>{await data}</p>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>failed: {(error as { message: string }).message}</p>
	{/snippet}
</svelte:boundary>
