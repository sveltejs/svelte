<script lang="ts">
	import { Warp } from 'svelte';

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp<string, string>('app');
	const greeting = warp.getOrInsertComputed('greeting', () => `hello from ${environment}`);
</script>

<p>{greeting}</p>
