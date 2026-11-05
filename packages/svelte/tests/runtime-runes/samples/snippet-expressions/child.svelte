<script>
	let { snippets, snippet, optional } = $props();
	let call = $derived(snippet);
	let apply = $derived(snippet);
	let bind = $derived(snippet);

	function getOptional() {
		return optional;
	}
</script>

{@render snippets[snippet]()}
<hr>
{@render snippets?.[snippet]?.()}
<hr>
{@render snippets[call]()}
<hr>
{@render snippets?.[apply]()}
<hr>
{@render snippets?.[bind]?.()}
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
