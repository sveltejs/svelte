<script>
	import { fork } from "svelte";

	let source = $state(0);
	let show = $state(false);
	const derived = $derived(source * 2);
</script>

<button onclick={() => {
	const f =fork(() => {
		show = true;
	})
	f.discard();
}}>fork</button>

<!-- only read derived during fork -->
{#if show}
	<p>{derived}</p>
{/if}

<!-- load bearing button! need something in template that updates source or else it gest optimized away -->
<button onclick={() => source++}>{source}</button>

