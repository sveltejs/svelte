<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<Child {count} />
<button onclick={() => count += 1}>+1</button>
