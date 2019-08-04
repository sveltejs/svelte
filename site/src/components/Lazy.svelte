<script>
	import { onMount } from 'svelte';

	let constructor;

	onMount(async () => {
		constructor = await $$props.this();
	});
</script>

<svelte:component this={constructor} {...$$props}/>