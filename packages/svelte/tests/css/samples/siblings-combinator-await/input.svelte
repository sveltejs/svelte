<style>
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .d { color: green; }
	.b + .e { color: green; }
	.c + .e { color: green; }
	.d + .e { color: green; }

	/* no match */
	.a + .e { color: red; }
	.b + .c { color: red; }
	.c + .d { color: red; }
	.b + .d { color: red; }
</style>

<div class="a"></div>

<!-- non-promise, so that something renders initially -->
{#await true}
	<div class="b"></div>
{:then value}
	<div class="c"></div>
{:catch error}
	<div class="d"></div>
{/await}

<div class="e"></div>
