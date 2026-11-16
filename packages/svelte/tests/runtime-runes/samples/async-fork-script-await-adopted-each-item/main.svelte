<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let items = $state<number[]>([]);
	let x = $state(0);
	let f: Fork;
	const requests: Array<{ settled: boolean; resolve: () => void }> = [];

	function push() {
		console.log(`await ${requests.length}`);
		const d = Promise.withResolvers<void>();
		requests.push({ settled: false, resolve: () => d.resolve() });
		return d.promise;
	}

	function resolve(index: number) {
		const request = requests[index];
		if (!request || request.settled) throw new Error(`No pending await ${index}`);
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => (f = fork(() => { items = [1]; x = 1; }))}>fork</button>
<button onclick={() => (items = [1])}>show</button>
<button onclick={() => resolve(0)}>resolve fork</button>
<button onclick={() => resolve(1)}>resolve real</button>
<button onclick={() => f.discard()}>discard</button>

{#each items as item (item)}
	<Child {push} {x} />
{/each}
