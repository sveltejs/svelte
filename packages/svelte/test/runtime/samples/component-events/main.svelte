<script>
	import { createEventDispatcher } from 'svelte';
	import Widget from './Widget.svelte';

	const dispatch = createEventDispatcher();

	export let visible;
</script>

<div>
	{#if visible}
		<Widget on:destroy='{() => dispatch("widgetTornDown")}'/>
	{/if}
</div>