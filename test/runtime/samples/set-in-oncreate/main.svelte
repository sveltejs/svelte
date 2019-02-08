<script>
	import { onMount } from 'svelte';

	export let foo = 1;

	onMount(() => {
		foo = 2;
	});
</script>

<p>{foo}</p>
