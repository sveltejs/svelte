<script>
	import { fork } from 'svelte';

	let x = $state(0);
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

<button onclick={() => (f = fork(() => x++))}>fork</button>
<button onclick={() => resolve(1)}>x1</button>
<button onclick={() => resolve('a')}>a</button>
<button onclick={() => resolve(0)}>x0</button>
<button onclick={() => f.commit()}>commit</button>

<svelte:boundary>
	<p>{await push('a')} {await push(x)}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
