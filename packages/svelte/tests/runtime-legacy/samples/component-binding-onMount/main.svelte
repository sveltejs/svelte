<script>
	import Mount from './Mount.svelte';
	import { onMount, mount } from 'svelte';

	onMount(() => {
		// @ts-ignore
		mount(Mount, { target: document.querySelector('#target') });
	});
</script>

<div id="target" />
