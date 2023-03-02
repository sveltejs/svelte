<script>
	import Child from './Child.svelte';
	const value = ['a'];
</script>

<div>
	{value[0]}
	{#each value as n}{n}{/each}
</div>
<div>
	<Child value={['b']} let:value>{value[0]}</Child>
</div>
<div>
	{value[0]}
	{#each value as n}{n}{/each}
</div>
