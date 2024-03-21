<script>
	import {Map} from 'svelte/reactivity';

	let state = new Map();
</script>

<button onclick={() => {
	state.set(state.size + 1, state.size + 1);
}}>add</button>

<button onclick={() => {
	state.delete(state.size);
}}>delete</button>

<button onclick={() => {
	state.clear();
}}>clear</button>

{#each state as [key, value]}
	<div>{key}:{value}</div>
{/each}
