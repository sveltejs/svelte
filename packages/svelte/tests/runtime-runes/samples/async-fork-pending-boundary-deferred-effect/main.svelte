<script>
	import { fork } from 'svelte';
	import Effect from './Effect.svelte';

	let show = $state(false);
	let hide = $state(false);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push({ v, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(v) {
		const i = queue.findIndex((e) => e.v === v);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => (hide = true)}>hide</button>
<button onclick={() => resolve('forked')}>resolve forked</button>
<button onclick={() => resolve('init')}>resolve init</button>
<button onclick={() => f.commit()}>commit</button>

<svelte:boundary>
	<Effect />

	<p>{await push('init')}</p>

	{#if show && !hide}
		<p>{await push('forked')}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
