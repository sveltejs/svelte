<script>
	import { fork } from 'svelte';
	let show = $state(false);
	let count = $state(0);
	let d_count = $derived(count);
</script>

<button onclick={() => count += 1}>{count}</button> <!-- just here so count is compiled as a source -->
<button onclick={() => fork(() => show = !show).commit()}>toggle</button>

{#if show}
	{d_count}
{/if}
