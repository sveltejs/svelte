<script>
	import { onMount } from "svelte"
	import Component from './Component.svelte';

	let key = $state(0);

	onMount(() => {
		key = 1;
	})
</script>

{#key key}
	<Component />
{/key}
