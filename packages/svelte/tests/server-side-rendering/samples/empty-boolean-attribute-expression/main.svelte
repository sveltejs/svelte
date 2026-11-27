<script>
	let { query = '' } = $props();
</script>

<button disabled={query && query.length < 3}>Search</button>
<input type="checkbox" checked={query} />
<div hidden={query}></div>
<svelte:element this={'button'} disabled={query}></svelte:element>
<my-element disabled={query}></my-element>
