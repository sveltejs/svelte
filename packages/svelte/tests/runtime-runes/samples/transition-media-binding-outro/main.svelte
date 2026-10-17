<script>
	import { fade } from 'svelte/transition';

	let item = $state({ currentTime: 0 });
</script>

<button onclick={() => (item = null)}>remove</button>

{#if item}
	<audio bind:currentTime={item.currentTime} transition:fade={{ duration: 100 }}></audio>
{/if}
