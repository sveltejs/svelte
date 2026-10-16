<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	let el;

	onMount(() => console.log('mount', el.isConnected));
	$effect(() => console.log('effect', el.isConnected));
</script>

<div bind:this={el}>{data}</div>
