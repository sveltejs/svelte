<script>
	import Child from './child.svelte';
	let snippet = $state('foo');
	let show = $state(false);
</script>

{#snippet foo()}
	<p>foo</p>
{/snippet}

{#snippet bar()}
	<p>bar</p>
{/snippet}

<Child snippets={{foo, bar}} {snippet} optional={show ? foo : undefined} />

<button on:click={() => { snippet = 'bar'; show = true; }}>toggle</button>
