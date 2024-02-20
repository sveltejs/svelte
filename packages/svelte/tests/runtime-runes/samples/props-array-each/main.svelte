<script>
	import Child from './child.svelte';

	let array = $state([{v: 1}]);

	const addNew = () => {
		array.push({v: 2})
	}
</script>

<button onclick={addNew}>add</button>
<Child {array} />
