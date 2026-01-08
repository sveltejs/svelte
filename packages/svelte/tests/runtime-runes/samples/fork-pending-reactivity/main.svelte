<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let pendingFork = $state(null);
</script>

<button onclick={() => {
	// Create fork but don't discard to simulate SvelteKit preload
	pendingFork = fork(() => {
		show = !show;
	});
}}>fork</button>

{#if show}
	hi
{:else}
	{#if show || !show}
		<Child />
	{/if}
{/if}
