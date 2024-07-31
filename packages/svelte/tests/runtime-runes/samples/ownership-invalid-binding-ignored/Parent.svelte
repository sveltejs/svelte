<script>
	import Child from './Child.svelte';

	let { test } = $props();
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Child bind:test />
