<script>
	import Child from './Child.svelte';
	let { x, y, z } = $props();
</script>

<!-- allowed -->
<Child foo={(x, y, z)} />

<!-- not allowed -->
<Child foo={x, y, z} />
