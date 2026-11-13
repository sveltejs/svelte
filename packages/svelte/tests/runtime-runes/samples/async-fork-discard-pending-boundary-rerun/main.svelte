<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => x++))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push(x)}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
