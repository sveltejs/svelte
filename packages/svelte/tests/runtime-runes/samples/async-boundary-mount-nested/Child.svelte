<script>
	import { onMount } from 'svelte';
	let { name } = $props();
	let el;

	onMount(() => {
		console.log(`mount ${name}: ${el.isConnected}`);
		return () => console.log(`unmount ${name}`);
	});
	$effect(() => {
		console.log(`effect ${name}: ${el.isConnected}`);
		return () => console.log(`cleanup ${name}`);
	});
</script>

<div bind:this={el}>{name}</div>
