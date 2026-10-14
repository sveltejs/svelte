<script lang="ts">
	import { Warp } from 'svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, Promise<string>>('app');
</script>

<svelte:boundary>
	<p>
		{await warp.getOrInsertComputed(
			'data',
			() => new Promise((_, reject) => setTimeout(() => reject(new Error(`from ${environment}`)), 10))
		)}
	</p>

	{#snippet pending()}
		<p>loading</p>
	{/snippet}

	{#snippet failed(error)}
		<p>failed: {(error as { message: string }).message}</p>
	{/snippet}
</svelte:boundary>
