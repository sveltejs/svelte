<script>
	export let array = [1, 2, 3];
	export let baz = 3;
	const foo = (item) => item;
</script>

{#each array as item}
	<p>{foo(item)}</p>
	{@const bar = array.map((item) => {
		const bar = baz;
		const foo = (item) => item * bar;
		return foo(item);
	})}
	<p>{bar}</p>
{/each}
