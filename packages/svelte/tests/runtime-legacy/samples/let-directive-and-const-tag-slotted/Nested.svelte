<script>
	export let things;
</script>

{#each things as thing}
	<slot name="foo" {thing} />
{/each}
