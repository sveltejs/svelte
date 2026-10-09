<script lang="ts">
	import { Warp } from "svelte";

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp('app');
	const unresolved = warp.getOrInsertComputed('unused_key', () => new Promise(
		(res, rej) => environment === 'server' ? setTimeout(() => res('did you ever hear the tragedy of darth plagueis the wise?'), 10) : rej('should not run')
	));
</script>

<svelte:boundary>
	<div>{await unresolved}</div>

	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
