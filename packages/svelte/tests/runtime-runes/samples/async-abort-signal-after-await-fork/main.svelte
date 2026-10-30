<script>
	import { fork, getAbortSignal } from 'svelte';

	let show = $state(false);
	let x = $state(0);
	let f;

	const queue = [];

	function load(v, signal) {
		console.log(`load ${v}`);
		const d = Promise.withResolvers();
		const entry = () => d.resolve(v);
		signal.addEventListener('abort', () => {
			console.log(`aborted ${v}`);
			if (queue.includes(entry)) queue.splice(queue.indexOf(entry), 1);
			d.reject(signal.reason);
		});
		queue.push(entry);
		return d.promise;
	}
</script>

<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => (f = fork(() => x++))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>

{#if show}
	<p>{await load(await Promise.resolve(x), getAbortSignal())}</p>
{/if}
