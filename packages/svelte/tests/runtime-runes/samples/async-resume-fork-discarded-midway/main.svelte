<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
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

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => resolve('a0')}>a0</button>
<button onclick={() => resolve('a1')}>a1</button>
<button onclick={() => resolve('ba0')}>ba0</button>
<button onclick={() => resolve('ba1')}>ba1</button>

{#if show}<Child {x} {push} />{/if}
