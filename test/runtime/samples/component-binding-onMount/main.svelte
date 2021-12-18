<script>
	import Mount from './Mount.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		const component = new Mount({
			target: document.querySelector('#target'),
			props: {},
		});
	});
</script>

<div id="target" />
