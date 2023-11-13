<script>
	let show_foo = $state(true);
	let snippet = $derived(show_foo ? foo : bar);
</script>

{#snippet foo()}
	<p>foo</p>
{/snippet}

{#snippet bar()}
	<p>bar</p>
{/snippet}

{@render snippet()}

<button on:click={() => show_foo = false}>show bar</button>
