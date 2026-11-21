<script lang="ts">
	import { tick } from 'svelte';

	let show = $state(false);
	const deferred = Promise.withResolvers<number>();

	async function run() {
		show = true;
		await tick();
		show = false;
		await tick();
		deferred.resolve(1);
	}
</script>

<button onclick={run}>Run</button>
<output>pending: {$effect.pending()}</output>

{#if show}
	{@const value = await deferred.promise}
	<p>{value}</p>
{/if}
