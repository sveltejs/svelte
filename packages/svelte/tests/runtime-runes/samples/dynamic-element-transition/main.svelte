<script>
	import { fade } from 'svelte/transition';

	let element = $state('div');
	let show = $state(false);
</script>

<button onclick={() => (show = !show)}>Toggle</button>

{#if show}
	<svelte:element this={element} transition:fade={{ duration: 100 }}>DIV</svelte:element>
{/if}
