<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, push }: {
		x: number;
		push: (label: string, value: number, signal?: AbortSignal) => Promise<number>;
	} = $props();

	let value = $derived(await push('value', x, getAbortSignal()));
	const snapshot = x;

	console.log(`continued with ${value} ${snapshot}`);
</script>

<p>{value} {snapshot}</p>
