<script>
	import { fade } from 'svelte/transition';
	import Effect from './Effect.svelte';

	let show = $state(true);
</script>

<button onclick={() => (show = false)}>hide</button>

<svelte:boundary>
	<Effect />

	{#if show}
		<p transition:fade={{ duration: 100 }}>{await new Promise(() => {})}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
