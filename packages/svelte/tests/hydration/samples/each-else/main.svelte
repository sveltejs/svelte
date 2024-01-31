<script>
	export let name = "world";
	export let foo = 'foo';
</script>

<h1>Hello, {name}</h1>
{#each [] as _}nope{:else}
	<p>{foo}</p>
{/each}

<!-- a single each block inside an element is "controlled", which is an optimization which we test here, too -->
<div>
	{#each [] as _}nope{:else}
		<p>{foo}</p>
	{/each}
</div>
