<script>
	import Child from "./Child.svelte"
</script>

<Child>
	<!-- I'm just a poor comment -->
	{#snippet children()}
		The content
	{/snippet}
</Child>
