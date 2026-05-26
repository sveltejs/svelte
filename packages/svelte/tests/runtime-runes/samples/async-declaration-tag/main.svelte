<script>
	const id = 'name';
	const top_id = await 'name';
</script>

{let name = $state(top_id)}
<button onclick={() => name = 'other'}>{name}</button>

{#if id}
	{let name = $state(await id)}
	{let greeting = $derived(await `Hello ${name}`)}

	<button onclick={() => name = 'other'}>change name</button>
	<p>{greeting}</p>
	<div>
		{const nested = 'nested'}
		{const greeting2 = $derived(await `Hi ${name}`)}
		<span>{nested} {greeting2}</span>
	</div>
{/if}
