<svelte:options customElement="my-element" />

<script>
	// to show that it doesn't bail out from the whole migration
	let count = $state(0);
</script>

<button onclick={()=>count++}><slot /></button>

{count}

{#if foo}
	<slot name="foo" {foo} />
{/if}

{#if bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if children}foo{/if}

<slot name="dashed-name" />