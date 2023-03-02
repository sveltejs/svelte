<script>
	let promise = Promise.resolve();
</script>

<style>
	.a ~ .b { color: green; }
	.a ~ .c { color: green; }
	.a ~ .d { color: green; }
	.b ~ .e { color: green; }
	.c ~ .e { color: green; }
	.d ~ .e { color: green; }
	.a ~ .e { color: green; }

	/* no match */
	.b ~ .c { color: green; }
	.c ~ .d { color: green; }
	.b ~ .d { color: green; }
</style>

<div class="a" />

{#await promise}
	<div class="b" />
{:then value}
	<div class="c" />
{:catch error}
	<div class="d" />
{/await}

<div class="e" />