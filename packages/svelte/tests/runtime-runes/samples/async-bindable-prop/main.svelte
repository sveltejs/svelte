<script>
	import Child from './Child.svelte';

	let value = $state('initial');
</script>

<Child bind:value />
<p>{value}</p>

