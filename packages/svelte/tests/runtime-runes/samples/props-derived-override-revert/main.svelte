<script>
	import Child from './Child.svelte';

	let ask = $state(false);
</script>

<button onclick={() => (ask = true)}>ask</button>

<Child show={!!ask} cancel={() => (ask = false)} />
