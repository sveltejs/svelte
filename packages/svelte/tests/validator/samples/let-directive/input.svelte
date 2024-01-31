{#if foo}
	<svelte:self let:x></svelte:self>
{/if}
<Component let:x></Component>
<div let:x></div><!-- strictly speaking this is invalid, but it was never checked in Svelte 3/4 either, and is now deprecated, so don't mind -->
<svelte:window let:x></svelte:window>