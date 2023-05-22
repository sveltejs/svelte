<svelte:options customElement="my-app" />

<script>
	import { onMount } from "svelte";

	export let prop = false;
	export let propsInitialized;
	export let wasCreated;

	onMount(() => {
		propsInitialized = prop !== false;
		wasCreated = true;
	});
</script>
