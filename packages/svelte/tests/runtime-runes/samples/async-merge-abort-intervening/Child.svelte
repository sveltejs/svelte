<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { a, x, push }: {
		a: number;
		x: number;
		push: (label: string, value: number, signal?: AbortSignal) => Promise<number>;
	} = $props();

	let value = $derived(await push('value', a, getAbortSignal()));
	const snapshot = x;
	console.log(`continued with ${value} ${snapshot}`);
</script>

<p>{value} {snapshot}</p>
