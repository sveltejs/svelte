<script>
	import { onDestroy } from 'svelte';
	import container from './container.js';

	let element;

	onDestroy(() => {
		container.div = element;
	});
</script>

<div bind:this={element}></div>
