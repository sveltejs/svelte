<script>
	import Child from './Child.svelte';

	let object = $state.raw({ count: 0 });
</script>

<Child bind:object />
<p>{object.count}</p>
