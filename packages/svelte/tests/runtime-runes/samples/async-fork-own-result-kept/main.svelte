<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let s = $derived(a > 0 || b > 0);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => (a = 1)))}>fork</button>
<button onclick={() => (b = 1)}>b</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.commit()}>commit</button>

<svelte:boundary>
	<p>{await push(`${a} ${s}`)}</p>
	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>
