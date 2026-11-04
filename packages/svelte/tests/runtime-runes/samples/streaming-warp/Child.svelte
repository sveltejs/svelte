<script lang="ts">
	import { Warp } from 'svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, Promise<string>>('app');
	const data = await warp.getOrInsertComputed(
		'data',
		() => new Promise((fulfil) => setTimeout(() => fulfil(`from ${environment}`), 10))
	);
</script>

<p>{data}</p>
