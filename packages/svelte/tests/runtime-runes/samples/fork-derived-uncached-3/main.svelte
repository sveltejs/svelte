<script>
	import { fork } from "svelte";

	let clicks = $state(0);
	let show = $state(false);
	const derived = $derived(clicks * 2);
</script>

<button onclick={() => {
	fork(() => {
		clicks += 1;
		show = true;
	}).discard();
}}>fork</button>

<button onclick={() => show = !show}>toggle</button>

<button onclick={() => clicks++}>clicks: {clicks}</button>

{#if show}
	<p>{derived}</p>
{/if}

