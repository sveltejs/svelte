<script>
	import Child from './Child.svelte';
	export let child;
	export let testcase;
	export let value;
	export let updates = [];
	$: updates = [...updates, value];
</script>

<div>parent: {value?.foo} | updates: {updates.length}</div>
<Child bind:value bind:this={child} {testcase} />
