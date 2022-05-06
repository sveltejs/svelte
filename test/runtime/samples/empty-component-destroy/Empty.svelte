
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		return () => console.log('destroy');
	});
</script>
