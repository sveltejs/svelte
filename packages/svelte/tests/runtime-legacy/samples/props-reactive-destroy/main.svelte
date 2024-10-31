<script>
	import Child from './Child.svelte';

	let active = true;
	let data = { example: 'This is some example data' };

	function log(data) {
		console.log('should fire once');
		return data;
	}
</script>

<button on:click={() => active = false}>Hide</button>

{#if active}
	<Child data={log(data)} />
{/if}