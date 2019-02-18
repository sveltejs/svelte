<script>
	import { fade } from 'svelte/transition';

	let visible;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p transition:fade>fades in and out</p>
{/if}
