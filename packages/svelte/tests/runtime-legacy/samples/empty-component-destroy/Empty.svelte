
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('destroy');
	});
</script>
