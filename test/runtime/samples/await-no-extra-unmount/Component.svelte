<script>
	import { onMount } from 'svelte';
	export let mounts;
	onMount(() => { ++mounts });
</script>

This component has been mounted {mounts} times.
