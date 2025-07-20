<script>
	import { close } from './Child.svelte';

	let { closed } = $props();

	$effect.pre(() => {
		if (closed) close();
	});
</script>
