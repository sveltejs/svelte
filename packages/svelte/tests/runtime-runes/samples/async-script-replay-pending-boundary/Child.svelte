<script lang="ts">
	import { getAbortSignal } from 'svelte';
	let { input, load }: {
		input: number;
		load: (site: string, value: number, signal: AbortSignal) => Promise<number>;
	} = $props();
	const a = $derived(await load('a', input, getAbortSignal()));
	const snapshot = a;
	const b = $derived(await load('b', a, getAbortSignal()));
	const c = $derived(await load('c', b, getAbortSignal()));
</script>

<p>{a}/{b}/{c}/{snapshot}</p>
