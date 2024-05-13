<script>
	let { snippets, snippet, optional } = $props();

	function getOptional() {
		return optional;
	}
</script>

{@render snippets[snippet]()}
<hr>
{@render snippets?.[snippet]?.()}
<hr>
{@render snippets.foo()}
<hr>
{@render snippets?.foo()}
<hr>
{@render snippets?.foo?.()}
<hr>
{@render snippets.foo?.()}
<hr>
{@render (optional ?? snippets.bar)()}
<hr>
{@render optional?.()}
<hr>
{@render getOptional()?.()}
