<script>
	import { log } from './log.js';
	import Component from './Component.svelte';

	let type = $state(Component)
	let elem = $state()

	$effect(() => {
		log.push(elem);
	});
</script>

<button onclick={() => {
	if (!type) {
		type = Component
	} else {
		type = false
	}
}}>Toggle</button>

<svelte:component bind:this={elem} this={type}>
	Content
</svelte:component>
