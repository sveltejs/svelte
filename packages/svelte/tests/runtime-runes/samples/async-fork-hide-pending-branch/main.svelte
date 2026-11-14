<script>
	import { fork } from 'svelte';
	import Effect from './Effect.svelte';

	let show = $state(true);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => (show = false)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<svelte:boundary>
	<Effect />

	{#if show}
		<p>{await push('slow')}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
