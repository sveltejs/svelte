<script>
	import { fork } from 'svelte';

	class Counter {
		count = $state(0);
	}

	let condition = $state(false);
	let counter = $derived(new Counter());
</script>

<button onclick={() => {
	fork(() => {
		condition = true;
	}).commit();
}}>fork</button>

{#if condition}
	<button onclick={() => {
		counter.count++;
	}}>click</button>
	<p>{counter.count}</p>
{/if}
