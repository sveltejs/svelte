<script>
	import { onMount } from 'svelte';

	export let isWidget;

	onMount(() => {
		isWidget = true;
	});
</script>

<p>i am a widget</p>