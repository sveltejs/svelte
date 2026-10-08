<script>
	import Child from './Child.svelte';
	const value = await Promise.resolve('ready');
</script>

<Child {value} />
