<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, load }: {
		x: number;
		load: (value: number, signal: AbortSignal) => Promise<number>;
	} = $props();

	const value = $derived(await load(x, getAbortSignal()));
	console.log(`continued ${value}`);
</script>

<p>{value}</p>
