<script>
	import Component from './Component.svelte';

	let type = $state(Component)
	let elem = $state()

	$effect(() => {
		console.log(elem);
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
