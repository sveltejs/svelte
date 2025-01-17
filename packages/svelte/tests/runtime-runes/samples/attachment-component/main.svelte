<script>
	import Child from './Child.svelte';
</script>

<Child attachments={[(node) => node.textContent = 'set from component']} />
