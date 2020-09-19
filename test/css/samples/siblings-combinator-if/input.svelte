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

<div class="a" />

{#if foo}
	<div class="b" />
{:else if bar}
	<div class="c" />
{:else}
	<div class="d" />
{/if}

<div class="e" />