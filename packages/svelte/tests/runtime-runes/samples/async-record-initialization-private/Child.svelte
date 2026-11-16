<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { x, load }: {
		x: number;
		load: (label: string, value: number, signal?: AbortSignal) => Promise<number>;
	} = $props();

	let first = $derived(await load('first', x));
	let second = $derived(await load('second', x, getAbortSignal()));

	console.log(`continued with ${first} ${second}`);
</script>

<p>{first} {second} {x}</p>
