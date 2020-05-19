<script>
	import { getContext, onMount } from 'svelte';
	import { get_current_component } from 'svelte/internal';
	onMount(() => {
		get_current_component();
	});
</script>