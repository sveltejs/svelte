<button><slot /></button>

{#if foo}
	<slot name="foo" {foo} />
{/if}
