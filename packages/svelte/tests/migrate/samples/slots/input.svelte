<button><slot /></button>

{#if foo}
	<slot name="foo" {foo} />
{/if}

{#if $$slots.bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if $$slots.default}foo{/if}

{#if $$slots['default']}foo{/if}

{#if $$slots['dashed-name']}foo{/if}

<slot name="dashed-name" />

<slot header="something" title={my_title} {id} />