<script>
	import { createEventDispatcher } from 'svelte';
	import Widget from './Widget.svelte';

	const dispatch = createEventDispatcher();
</script>

<div>
	<Widget on:select='{event => dispatch("select", event.detail.selection)}'/>
</div>