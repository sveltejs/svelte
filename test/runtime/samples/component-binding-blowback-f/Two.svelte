<script>
	import { onMount } from 'svelte';

	export let i, j;
	export let value;

	onMount(() => {
		value = { i, j };
	});
</script>