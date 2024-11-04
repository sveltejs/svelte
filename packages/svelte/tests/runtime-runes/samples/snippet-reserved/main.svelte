<script>
	import Child from './Child.svelte';
</script>

<Child>
	{#snippet catch()}
		<p>hello world</p>
	{/snippet}
</Child>
