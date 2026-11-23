<script lang="ts">
	import { mount, onMount, unmount } from 'svelte';
	import { on } from 'svelte/events';
	import Placeholder from './Placeholder.svelte';

	let target: HTMLElement;
	let dialog = $state<HTMLElement>();
	let open = $state(false);
	let clicks = $state(0);

	onMount(() => {
		const app = mount(Placeholder, { target, props: { children: content } });
		return () => unmount(app);
	});

	$effect(() => {
		if (!dialog) return;

		const cleanups = [
			// stopping propagation must not prevent the next listener on the same element from running
			on(dialog, 'click', (event) => event.stopPropagation()),
			on(dialog, 'click', () => (open = false))
		];

		return () => cleanups.forEach((cleanup) => cleanup());
	});
</script>

<button onclick={() => (open = true)}>open</button>
<div bind:this={target}></div>
<output>{clicks}:{open}</output>

{#snippet content()}
	{#if open}
		<div role="dialog" bind:this={dialog}>
			<button onclick={() => clicks++}>action</button>
		</div>
	{/if}
{/snippet}
