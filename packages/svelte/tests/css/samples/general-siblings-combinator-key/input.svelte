<div class="a"></div>

{#key x}
	<div class="b"></div>
{/key}

<div class="c"></div>

<style>
	.a ~ .b { color: green; }
	.a ~ .c { color: green; }
	.b ~ .c { color: green; }
</style>
