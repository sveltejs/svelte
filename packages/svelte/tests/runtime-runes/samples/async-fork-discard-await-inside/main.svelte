<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let x = $state(0);
	let f;

	const queue = [];

	function load(v) {
		console.log(`load ${v}`);
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => (f = fork(() => x++))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

{#if show}
	<p>{await load(await Promise.resolve(x))}</p>
{/if}
