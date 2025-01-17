<script>
	import Child from './Child.svelte';

	let stuff = $state({
		attachments: [(node) => node.textContent = 'set from component']
	});
</script>

<Child {...stuff} />
