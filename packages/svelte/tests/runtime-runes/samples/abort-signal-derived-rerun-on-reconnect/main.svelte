<script>
	import { getAbortSignal } from 'svelte'
	
	let show = $state(true)
	let count = $state(0);
	let queued = [];

	export function sleep(value, signal) {
	  return new Promise((resolve, reject) => {
	    signal.addEventListener('abort', reject, { once: true });
		queued.push(() => resolve(value));
	  });
	}

	const double = $derived(sleep(count * 2, getAbortSignal()));
</script>

<button onclick={() => count += 1}>clicks: {count}</button>
<button onclick={() => show = !show}>toggle</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<div>
	{#if show}
		{#await double}
			loading
		{:then value}
			{value}
		{:catch}
			error
		{/await}
	{/if}
</div>
