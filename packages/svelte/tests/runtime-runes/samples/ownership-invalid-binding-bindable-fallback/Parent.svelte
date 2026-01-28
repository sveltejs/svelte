<script>
	import Child from './Child.svelte';

	let { test = $bindable({}) } = $props();
</script>

<Child bind:test />
