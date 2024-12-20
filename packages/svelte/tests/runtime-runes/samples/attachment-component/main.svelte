<script>
	import Child from './Child.svelte';
</script>

<Child {@attach (node) => node.textContent = 'set from component'} />
