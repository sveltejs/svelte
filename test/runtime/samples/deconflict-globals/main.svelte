<script>
	const document = 'I hereby declare Svelte the bestest framework.';
	const console = 'nintendo sixty four';
	const Error = 'Woops.';
	const Object = 42;
	const Map = false;

	const everyone = [document, console, Error, Object, Map];
</script>

<svelte:head>
	<title>Cute test</title>
</svelte:head>

<svelte:window on:click></svelte:window>
<svelte:body on:mouseenter></svelte:body>

{#each everyone as someone (someone)}
	<p>{someone}</p>
{/each}
