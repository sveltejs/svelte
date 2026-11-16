<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, begin, load }: {
		x: number;
		begin: () => Promise<void>;
		load: (value: number, signal: AbortSignal) => Promise<number>;
	} = $props();

	await begin();
	const value = $derived(await load(x, getAbortSignal()));
	const snapshot = x;
	console.log(`continued ${value} ${snapshot}`);
</script>

<p>{value} {snapshot}</p>
