<script>
	import {Set} from 'svelte/reactivity';

	let state = new Set();
</script>

<button onclick={() => {
	state.add(state.size + 1);
}}>add</button>

<button onclick={() => {
	state.delete(state.size);
}}>delete</button>

<button onclick={() => {
	state.clear();
}}>clear</button>

{#each state as item}
	<div>{item}</div>
{/each}
