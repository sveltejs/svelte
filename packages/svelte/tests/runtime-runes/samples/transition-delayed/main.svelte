<script>
	import { fade } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<p transition:fade={{ delay: 100, duration: 100 }}>delayed fade</p>
{/if}
