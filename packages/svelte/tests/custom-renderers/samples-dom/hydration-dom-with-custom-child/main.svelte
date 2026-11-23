<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => (count += 1)}>{count}</button>
<Child message="hello"></Child>
<p>after</p>
