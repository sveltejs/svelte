<script>
	let promise = Promise.resolve();
</script>

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

{#await promise then value}
	<div class="b"></div>
{:catch error}
	<div class="c"></div>
{/await}

{#await promise}
	<div class="d"></div>
{:catch error}
	<div class="e"></div>
{/await}

{#await promise}
	<div class="f"></div>
{:then error}
	<div class="g"></div>
{/await}

<div class="h"></div>
