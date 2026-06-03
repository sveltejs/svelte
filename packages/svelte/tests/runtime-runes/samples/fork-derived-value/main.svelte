<script>
	import { fork } from "svelte";

	let state = $state(0);
	let count = $derived(state);
</script>

<button onclick={() => {
	fork(() => {
		state++;
	});
}}>fork</button>

<button onclick={() => {
	state++;
}}>update</button>

{#if count === 1}
	<p>one</p>
{/if}
