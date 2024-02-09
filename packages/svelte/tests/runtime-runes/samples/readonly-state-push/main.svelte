<script>
  import Child from './Child.svelte';

	let array = $state([1,2,3,4]);

	const addNew = () => {
		array.push(0)
	}
</script>

<button onclick={addNew}>add</button>
<Child {array} />

