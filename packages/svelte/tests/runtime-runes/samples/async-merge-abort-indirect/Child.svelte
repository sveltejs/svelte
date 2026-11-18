<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, load }: {
		x: number;
		load: (value: number, signal: AbortSignal) => Promise<number>;
	} = $props();

	// The synchronous derived owns the signal, not the async expression awaiting its promise.
	let promise = $derived(load(x, getAbortSignal()));
	let value = $derived(await promise);
	console.log(`continued ${value}`);
</script>

<p>{value}</p>
