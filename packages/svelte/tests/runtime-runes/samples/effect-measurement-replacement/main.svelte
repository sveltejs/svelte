<script>
	import Node from './Node.svelte';
	import Relayout from './Relayout.svelte';

	let nodes = $state.raw([{ id: 'a', measured: false }]);
	let initialized = $derived(nodes.every((node) => node.measured));
	let observations = $state(0);
</script>

<button onclick={() => nodes = [{ id: 'a', measured: true }]}>measure</button>
<p>{observations}</p>
{#each nodes as node (node.id)}
	<Node {node} observe={() => observations++} />
{/each}
<Relayout {initialized} replace={() => nodes = [{ id: 'a', measured: false }]} />
