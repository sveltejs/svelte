<script>
	import Trigger from './Trigger.svelte';

	let mounted = $state(true);
	let broken = $state(false);

	// Throwing derived — nothing in the live template reads `appContext`, so
	// invalidating it does NOT throw immediately (becomes dirty-and-unread).
	let data = $derived(broken ? null : { value: 'ok' });
	let appContext = $derived(data.value);
</script>

<button id="break" onclick={() => (broken = true)}>break</button>
<button id="unmount" onclick={() => (mounted = false)}>unmount</button>

{#if mounted}
	<svelte:boundary onerror={() => {}}>
		<Trigger getValue={() => appContext} />
	</svelte:boundary>
{/if}
