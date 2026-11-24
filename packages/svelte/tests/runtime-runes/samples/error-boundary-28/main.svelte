<script>
	import Trigger from './Trigger.svelte';

	let mounted = $state(true);
	let broken = $state(false);

	// Throwing derived — nothing in the live template reads `appContext`, so
	// invalidating it does NOT throw immediately (becomes dirty-and-unread).
	let data = $derived(broken ? null : { value: 'ok' });
	let appContext = $derived(data.value);
</script>

<svelte:boundary>
	<button onclick={() => (broken = true)}>break</button>
	<button onclick={() => (mounted = false)}>unmount</button>

	{#if mounted}
		<Trigger getValue={() => appContext} />
	{/if}

	{#snippet failed()}
		<p>caught</p>
	{/snippet}
</svelte:boundary>
