<script>
	import Child from './child.svelte';
</script>

<Child>
	Default
	{#snippet named({ foo })}
		Named {foo}
	{/snippet}
</Child>
