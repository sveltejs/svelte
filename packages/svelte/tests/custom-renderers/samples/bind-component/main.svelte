<script>
	import Child from './Child.svelte';

	let value = $state('hello');
</script>

<Child bind:value />
