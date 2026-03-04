
<script>
	import { slide } from 'svelte/transition';
	let showText = $state(false);
	let show = $state(true);
</script>

<button onclick={() => showText = !showText}>
	Toggle
</button>

{#if showText}
	{#if show}
		<div transition:slide>
			Should not transition out
		</div>
	{/if}
{/if}
