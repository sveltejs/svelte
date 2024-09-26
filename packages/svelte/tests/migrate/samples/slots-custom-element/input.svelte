<svelte:options customElement="my-element" />

<script>
	// to show that it doesn't bail out from the whole migration
	let count = 0;
</script>

<button on:click={()=>count++}><slot /></button>

{count}

{#if foo}
	<slot name="foo" {foo} />
{/if}

{#if $$slots.bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if $$slots.default}foo{/if}

<slot name="dashed-name" />
