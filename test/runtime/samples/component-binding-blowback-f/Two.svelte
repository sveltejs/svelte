<script>
	import { onMount } from 'svelte';

	export let value;

	onMount(() => {
		value = { x: true };
	});
</script>