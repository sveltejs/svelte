<script>
	let foo = false;
	let array = [1];
</script>

<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .d { color: green; }
	.b + .d { color: green; }
	.c + .d { color: green; }

	.a + .c + .c { color: green; }
	.c + .c + .d { color: green; }
	.a + .c + .c + .d { color: green; }

	/* no match */
	.b + .c { color: green; }
</style>

<div class="a"></div>

{#if foo}
	<div class="b"></div>
{:else}
	{#each array as item}
		<div class="c"></div>
	{/each}
{/if}

<div class="d"></div>
