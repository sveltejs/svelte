<button><slot /></button>

{#if foo}
	<slot name="foo" {foo} />
{/if}

{#if $$slots.bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if $$slots.default}foo{/if}

<slot name="dashed-name" />
