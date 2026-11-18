<script>
	let bag = $state({ t: [], d: [], l: [] });
	let shared = $state([]);
</script>

{#snippet pair(name)}
	<p class="own">
		<input type="checkbox" value="a" bind:group={bag[name]} />
		<input type="checkbox" value="b" bind:group={bag[name]} />
		{name}: {bag[name].join(',')}
	</p>
{/snippet}

{#snippet one(value)}
	<input class="shared" type="checkbox" {value} bind:group={shared} />
{/snippet}

{@render pair('t')}
{@render pair('d')}
{@render pair('l')}

{@render one('x')}
{@render one('y')}
<p class="shared">{shared.join(',')}</p>
