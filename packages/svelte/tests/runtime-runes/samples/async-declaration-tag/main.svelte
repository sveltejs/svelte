<script>
	const id = 'name';
</script>

{#if id}
	{let name = $state(await id)}
	{let greeting = $derived(await `Hello ${name}`)}

	<button onclick={() => name = 'other'}>change name</button>
	<p>{greeting}</p>
{/if}
