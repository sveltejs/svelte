<script lang="ts">
	import { Warp } from "svelte";

	const { environment }: { environment: 'server' | 'browser' } = $props();

	const warp = new Warp('app');
	const partially_used = warp.getOrInsertComputed('partially_used', () => ({
		used: new Promise(
			(res, rej) => environment === 'server' ? setTimeout(() => res('did you ever hear the tragedy of darth plagueis the wise?'), 0) : rej('should not run')
		),
		unused: new Promise(
			(res, rej) => environment === 'server' ? setTimeout(() => res('no, sith daddy, please tell me'), 0) : rej('should not run')
		),
	}));
</script>

<div>{await partially_used.used}</div>
<svelte:boundary>
	<div>{await partially_used.unused}</div>
	{#snippet pending()}
		<div>Loading...</div>
	{/snippet}
</svelte:boundary>
