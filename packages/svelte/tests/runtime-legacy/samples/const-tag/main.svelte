<svelte:options runes={false} />
{#if true}
	{@const foo = bar}
	{@const yoo = foo}
	{@const bar = 'world'}
	<h1>Hello {bar}{yoo}!</h1>
{/if}
