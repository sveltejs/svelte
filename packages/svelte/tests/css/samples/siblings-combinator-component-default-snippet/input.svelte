<script>
	import Child from './Child.svelte';
</script>

<x></x>

<Child>
	<y>this should be green</y>
</Child>

<style>
	x + y {
		color: green;
	}
</style>
