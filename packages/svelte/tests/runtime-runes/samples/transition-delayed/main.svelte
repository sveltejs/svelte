<script>
	import { fade } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<!-- explicit opacity necessary for some reason, else it's calculated as 0 -->
	<p transition:fade={{ delay: 100, duration: 100 }} style="opacity: 1">delayed fade</p>
{/if}
