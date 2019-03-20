<script>
	export let things;
	export let foo;
</script>

{#each things as thing}
	<span>{thing.name}</span>
	{@debug foo}
{/each}

<p>foo: {foo}</p>