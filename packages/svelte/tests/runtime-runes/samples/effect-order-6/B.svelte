<script>
	import { close } from './Child.svelte';

	let { closed } = $props();

	$effect(() => {
		if (closed) close();
	});
</script>
