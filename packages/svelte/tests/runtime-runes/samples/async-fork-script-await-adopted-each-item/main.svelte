<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let items = $state([]);
	let x = $state(0);
	let f;

	const queue = [];

	function push() {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve());
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => { items = [1]; x = 1; }))}>fork</button>
<button onclick={() => (items = [1])}>show</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.discard()}>discard</button>

{#each items as item (item)}
	<Child {push} {x} />
{/each}
