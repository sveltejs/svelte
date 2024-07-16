<style>
	.a ~ .b { color: green; }
	.a ~ .c { color: green; }
	.a ~ .d { color: green; }
	.a ~ .e { color: green; }
	.a ~ .f { color: green; }
	.a ~ .g { color: green; }
	.a ~ .h { color: green; }

	.b ~ .d { color: green; }
	.c ~ .d { color: green; }
	.b ~ .e ~ .f ~ .h { color: green; }
	.b ~ .d ~ .h { color: green; }
	.c ~ .g { color: green; }
</style>

<div class="a"></div>

<!-- non-promise, so that something renders initially -->
{#await true then value}
	<div class="b"></div>
{:catch error}
	<div class="c"></div>
{/await}

{#await true}
	<div class="d"></div>
{:catch error}
	<div class="e"></div>
{/await}

{#await true}
	<div class="f"></div>
{:then error}
	<div class="g"></div>
{/await}

<div class="h"></div>
