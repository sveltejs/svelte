<script>
	import { onDestroy } from 'svelte';

	const { data = 123 } = $props();

	onDestroy(() => {
		data;
	});
</script>

{data ? '' : null}
