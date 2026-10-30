<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => { show = false; x = 0; }}>reset</button>

{#if show}
	<Child {x} {push} />
{/if}
