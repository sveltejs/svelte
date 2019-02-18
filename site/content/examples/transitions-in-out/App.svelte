<script>
	import { fade, fly } from 'svelte/transition';

	let visible;
</script>

<input type=checkbox bind:checked={visible}> visible

{#if visible}
	<p in:fly="{{y: 50}}" out:fade>flies up, fades out</p>
{/if}
