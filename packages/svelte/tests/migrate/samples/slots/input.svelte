<button><slot /></button>

{#if foo}
	<slot name="foo" {foo} />
{/if}

<slot name="dashed-name" />