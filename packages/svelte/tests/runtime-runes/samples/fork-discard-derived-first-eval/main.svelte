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

<!-- load bearing button! need something in template that updates clicks or else it gest optimized away -->
<button onclick={() => clicks++}>clicks: {clicks}</button>

<!-- only read derived during fork -->
{#if show}
	<p>{derived}</p>
{/if}

