<script>
	import Child from './Child.svelte';
</script>

<Child>
	Default
	{#snippet named({ foo })}
		Named {foo}
	{/snippet}
</Child>
