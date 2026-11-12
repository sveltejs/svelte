<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push('slow')}</p>

	{#if show}
		<p>{await push('forked')}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
