<script>
	import Child from './Child.svelte';
</script>

<Child>
	Default
	{#snippet named()}
		Named 
	{/snippet}
</Child>
