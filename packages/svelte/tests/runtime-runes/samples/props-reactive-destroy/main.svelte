<script>
	import Child from './Child.svelte';

	let active = $state(true);
	let data = $state({ example: 'This is some example data' });

	function log(data) {
		console.log('should fire once');
		return data;
	}
</script>

<button onclick={() => (active = false)}>Hide</button>

{#if active}
	<Child data={log(data)} />
{/if}
