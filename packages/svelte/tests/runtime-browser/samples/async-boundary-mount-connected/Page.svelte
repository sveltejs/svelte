<script>
	import Child from './Child.svelte';
	const data = await new Promise((resolve) => setTimeout(() => resolve('loaded')));
</script>

<Child {data} />
