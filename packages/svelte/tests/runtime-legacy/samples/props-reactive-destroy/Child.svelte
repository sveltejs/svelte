<script>
	import { onDestroy } from 'svelte';

	export let data;
	
	onDestroy(() => {
		data;
	});
</script>

{data ? '' : null}