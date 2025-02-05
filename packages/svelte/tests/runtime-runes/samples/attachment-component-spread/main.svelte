<script>
	import Child from './Child.svelte';

	let stuff = $state({
		[Symbol()]: (node) => node.textContent = 'set from component'
	});
</script>

<Child {...stuff} />
