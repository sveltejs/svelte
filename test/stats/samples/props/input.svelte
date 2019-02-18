<script>
	export let name = 'world';
	export let cats;

	let foo = 1;
	let bar;

	$: bar = foo * 2;
</script>

<h1>Hello {name}!</h1>

<ul>
	{#each cats as cat}
		<li><a target="_blank" href={cat.video}>{cat.name}</a></li>
	{/each}
</ul>

<p>bar: {bar}</p>