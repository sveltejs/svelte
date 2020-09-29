<script context='module'>
	let foo;
</script>

<script>
	import { onMount } from 'svelte';
	let bar;
	onMount(() => bar = foo);
</script>

<div bind:this={foo}>{typeof bar}</div>
