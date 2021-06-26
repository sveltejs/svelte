<script>
	let a = [
		{ a: { b: 'Hello', c: 'World' }, key: 'b' },
	];
</script>

{#each a as { a, key }}
	<div>
		{key}: {a[key]}
		<input bind:value={a[key]}>
	</div>
{/each}

<button on:click={() => a[0].key = 'c'}>Button</button>