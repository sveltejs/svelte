<script>
	let promise = Promise.resolve();
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
	.c + .d { color: green; }
	.b + .d { color: green; }
</style>

<div class="a"></div>

{#await promise}
	<div class="b"></div>
{:then value}
	<div class="c"></div>
{:catch error}
	<div class="d"></div>
{/await}

<div class="e"></div>
