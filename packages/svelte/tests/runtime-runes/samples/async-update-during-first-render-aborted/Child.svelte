<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let { count, value, slow }: {
		count: number;
		value: Promise<string>;
		slow: (n: number, signal: AbortSignal) => Promise<number>;
	} = $props();

	const shown = $derived(await value);
	const held = $derived(await slow(count, getAbortSignal()));
</script>

<p>{shown} {held}</p>
