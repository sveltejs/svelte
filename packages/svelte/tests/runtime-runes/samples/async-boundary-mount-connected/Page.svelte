<script>
	import Child from './Child.svelte';
	const data = await Promise.resolve('loaded');
</script>

<Child {data} />
