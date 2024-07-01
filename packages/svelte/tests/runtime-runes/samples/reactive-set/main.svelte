<script>
	import { SvelteSet } from 'svelte/reactivity';

	let state = new SvelteSet([0]);
</script>

<button onclick={() => state.delete(0)}>delete initial</button>
<button onclick={() => state.add(state.size + 1)}>add</button>
<button onclick={() => state.delete(state.size)}>delete</button>
<button onclick={() => state.clear()}>clear</button>

<div id="output">
	<p>{state.size}</p>

	{#each state as item}
		<div>{item}</div>
	{/each}
</div>
