<svelte:options customElement="my-app" />

<script>
	import { onMount } from 'svelte';
	import Child from './Child.svelte';

	let items = $state([]);

	// Add the item _after_ the initial mount, so that the each block renders the
	// new item into an offscreen anchor that is discarded once it's committed to
	// the DOM. This reproduces styles being injected into `document.head` instead
	// of the shadow root (https://github.com/sveltejs/svelte/issues/18288)
	onMount(() => {
		items = [1];
	});
</script>

{#each items as item (item)}<Child />{/each}
