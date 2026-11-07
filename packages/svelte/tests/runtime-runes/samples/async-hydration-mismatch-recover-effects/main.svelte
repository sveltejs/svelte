<script>
	import Child from './Child.svelte';
</script>

<Child label={await Promise.resolve('child')} />
