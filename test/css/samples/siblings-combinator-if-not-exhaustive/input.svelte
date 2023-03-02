<script>
	let foo = true;
	let bar = true;
</script>

<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .d { color: green; }
	.b + .d { color: green; }
	.c + .d { color: green; }

	/* no match */
	.b + .c { color: green; }
</style>

<div class="a" />

{#if foo}
	<div class="b" />
{:else if bar}
	<div class="c" />
{/if}

<div class="d" />