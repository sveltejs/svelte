<svelte:options customElement="my-app" />

<script>
	import { onMount, onDestroy } from "svelte";

	let el;
	let parentEl;

	onMount(() => {
		parentEl = el.parentNode.host.parentElement;

		return () => {
			parentEl.dataset.onMountDestroyed = true;
		};
	});

	onDestroy(() => {
		parentEl.dataset.destroyed = true;
	});
</script>

<div bind:this={el} />
