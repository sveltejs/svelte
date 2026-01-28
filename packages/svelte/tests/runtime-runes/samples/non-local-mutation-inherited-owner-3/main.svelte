<script>
	import Child from './Child.svelte';

	let items = $state([{ id: "test", name: "this is a test"}, { id:"test2", name: "this is a second test"}]);
	let found = $state();

	function onclick() {
		found = items.find(c => c.id === 'test2');
	}
</script>

<button {onclick}>First click here</button>
<Child item={found} />
