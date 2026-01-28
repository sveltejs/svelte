<button><slot /></button>

{#if foos}
	<slot name="foo" foo={foos} />
{/if}

{#if $$slots.bar}
	{$$slots}
	<slot name="bar" />
{/if}

{#if $$slots.default}foo{/if}

{#if $$slots['default']}foo{/if}

<slot header="something" title={my_title} {id} />