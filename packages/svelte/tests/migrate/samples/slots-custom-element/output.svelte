<svelte:options customElement="my-element" />

<button><slot /></button>

{#if foo}
	<slot name="foo" {foo} />
{/if}

{#if bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if children}foo{/if}

<slot name="dashed-name" />