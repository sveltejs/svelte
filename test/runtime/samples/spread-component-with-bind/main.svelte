<script>
	import Widget from './Widget.svelte';

	export let props = {};
	export let x = 'foo';
</script>

<svelte:component this={Widget} {...props} bind:value={x} />