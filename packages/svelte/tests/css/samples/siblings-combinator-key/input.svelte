<div class="a"></div>

{#key x}
	<div class="b"></div>
{/key}

<div class="c"></div>

<style>
	.a + .b { color: green; }
	.b + .c { color: green; }

	/* no match */
	.a + .c { color: red; }
</style>
