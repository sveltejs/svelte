<script>
	import { onMount } from 'svelte';
	import { measurements } from './measurements.js';
	let { data } = $props();
	let el;

	onMount(() => measurements.push(['mount', el.isConnected, el.offsetWidth, el.offsetHeight]));
	$effect(() => measurements.push(['effect', el.isConnected, el.offsetWidth, el.offsetHeight]));
</script>

<div bind:this={el} style="width: 100px; height: 50px">{data}</div>
