<script>
	let foo = true;
	let bar = true;
</script>

<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .d { color: green; }
	.b + .e { color: green; }
	.c + .e { color: green; }
	.d + .e { color: green; }

	/* no match */
	.a + .e { color: green; }
	.b + .c { color: green; }
	.b + .d { color: green; }
	.c + .d { color: green; }
</style>

<div class="a"></div>

{#if foo}
	<div class="b"></div>
{:else if bar}
	<div class="c"></div>
{:else}
	<div class="d"></div>
{/if}

<div class="e"></div>
