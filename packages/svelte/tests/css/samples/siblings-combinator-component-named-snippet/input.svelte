<script>
	import Child from './Child.svelte';
</script>

<x></x>

<Child>
	{#snippet foo()}
		<y>this should be green</y>
	{/snippet}
</Child>

<style>
	x + y {
		color: green;
	}
</style>
