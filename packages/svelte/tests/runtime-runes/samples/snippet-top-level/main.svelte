<script>
	const {children = snippet} = $props();
</script>
{@render children()}
{#snippet snippet()}
	<p>hello world</p>
{/snippet}
