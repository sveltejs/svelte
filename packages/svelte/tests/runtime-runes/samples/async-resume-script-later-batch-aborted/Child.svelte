<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, push }: {
		x: number;
		push: (label: string, v: number, signal: AbortSignal) => Promise<number>;
	} = $props();

	let first = $derived(await push('first', x, getAbortSignal()));
	let second = $derived(await push('second', x, getAbortSignal()));

	console.log(`continued with ${first} ${second}`);
</script>

<p>{first} {second}</p>
