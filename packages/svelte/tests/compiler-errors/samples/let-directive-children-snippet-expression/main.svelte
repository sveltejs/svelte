<script>
	import Child from './irrelevant';
</script>

<Child let:item={x}>
	{#snippet children()}{x}{/snippet}
</Child>
