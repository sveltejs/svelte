<script>
	let tag = 'div'
</script>

<div>
	<p class="before">before</p>
	<svelte:element class="x" this={tag}></svelte:element>
	<p class="foo">
		<span>foo</span>
	</p>
	<p class="bar">bar</p>
</div>
{#each [1]}
	<svelte:element class="z" this={tag}></svelte:element>
{/each}

<style>
	.before + .foo { color: green; }
	.before ~ .foo { color: green; }
	.before ~ .bar { color: green; }

	.x + .foo { color: green; }
	.x + .foo span { color: green; }
	.x ~ .foo { color: green; }
	.x ~ .foo span { color: green; }
	.x ~ .bar { color: green; }

	.z + .z { color: green; }
	.z ~ .z { color: green; }

	/* no match */
	.x + .bar { color: green; }
</style>
