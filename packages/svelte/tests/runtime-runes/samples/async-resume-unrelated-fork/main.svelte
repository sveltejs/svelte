<script>
	import { fork } from 'svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);
	let f;

	const queue = [];

	function push(v) {
		console.log(`push ${v}`);
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => (f = fork(() => (b = true)))}>fork</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => { a = b = false; x = 0; }}>reset</button>

<span>{b}</span>

{#if a || b}
	<p>{await push(x)} {x}</p>
{/if}
