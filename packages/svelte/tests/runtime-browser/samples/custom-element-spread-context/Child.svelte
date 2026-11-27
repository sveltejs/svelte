<script>
	import { onDestroy } from 'svelte';

	let { target } = $props();

	onDestroy(() => {
		target.dataset.destroyed = 'true';
	});
</script>

<p>child</p>
