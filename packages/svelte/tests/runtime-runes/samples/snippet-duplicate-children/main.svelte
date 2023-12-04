<script>
	import Child from './Child.svelte';
</script>

<Child>
	{#snippet children()}
		Hello
	{/snippet}
</Child>

<Child>
	{#snippet children()}
		World
	{/snippet}
</Child>
