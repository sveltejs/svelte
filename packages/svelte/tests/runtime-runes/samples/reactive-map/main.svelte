<script>
	import { SvelteMap } from 'svelte/reactivity';

	let state = new SvelteMap([[0, 0]]);
</script>

<button
	onclick={() => {
		if (state.has(0)) {
			state.set(0, 1);
		}
	}}
>
	set if
</button>

<button
	onclick={() => {
		if (state.get(0) === 1) {
			state.set(0, 0);
		}
	}}
>
	set if 1
</button>

<button
	onclick={() => {
		state.set(state.size + 1, state.size + 1);
	}}>add</button
>

<button
	onclick={() => {
		state.delete(state.size);
	}}>delete</button
>

<button
	onclick={() => {
		state.clear();
	}}>clear</button
>

{#each state as [key, value]}
	<div>{key}:{value}</div>
{/each}
