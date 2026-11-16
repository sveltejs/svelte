<script lang="ts">
	import { getAbortSignal } from 'svelte';
	let { wait }: { wait: (signal: AbortSignal) => Promise<void> } = $props();
	const value = $derived(await wait(getAbortSignal()));
</script>
<span>{value}</span>
