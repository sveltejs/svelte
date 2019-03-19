<script>
	export let items;
	export let foo;
	export let bar;
</script>

{#each items as item}
	<button on:click='{() => foo = bar}'>{item}</button>
{/each}

<p>foo: {foo}</p>