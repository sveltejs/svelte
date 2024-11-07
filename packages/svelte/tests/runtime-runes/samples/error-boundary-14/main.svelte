<script>
	import Child from "./Child.svelte";

	function throw_error() {
		throw new Error('test')
	}
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<Child />
</svelte:boundary>


