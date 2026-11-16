<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, push, label }: {
		x: number;
		push: (label: string, value: number, signal?: AbortSignal) => Promise<number>;
		label: string;
	} = $props();

	let value = $derived(await push(label, x, getAbortSignal()));
	const snapshot = x;
	console.log(`continued ${label} with ${value} ${snapshot}`);
</script>

<p>{label}: {value} {snapshot}</p>
