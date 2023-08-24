<svelte:options
	customElement={{
		tag: 'custom-element',
		props: {
			expanded: { reflect: true, type: 'Boolean', attribute: 'aria-expanded' }
		}
	}}
/>

<script>
	export let expanded = false;
</script>

<div>
	<button on:click={() => (expanded = !expanded)}>Toggle</button>
	<div class:hidden={!expanded}>Hidden Text</div>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
