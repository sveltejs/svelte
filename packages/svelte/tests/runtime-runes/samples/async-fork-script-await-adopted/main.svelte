<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let count = $state(0);
	let f;

	const queue = [];

	function push() {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve());
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => count++}>count</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.commit()}>commit</button>

<span>{count}</span>

{#if show}
	<Child {push} {x} />
{/if}
