<script>
	let { snippets, snippet, optional } = $props();
</script>

{@render snippets[snippet]()}
<hr>
{@render optional?.()}
