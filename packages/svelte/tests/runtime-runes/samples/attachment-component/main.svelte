<script>
	import Child from './Child.svelte';
</script>

<Child {@use (node) => node.textContent = 'set from component'} />
