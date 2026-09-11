<svelte:head><meta name="x" content="y" /></svelte:head>

<style>
	:export { foo: red; }
	:is(:global(td), :global(th)) { color: red; }
</style>
