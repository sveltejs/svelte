<script>
	let array = [];
</script>

<style>
	.a ~ .b { color: green; }
	.a ~ .c { color: green; }
	.b ~ .d { color: green; }
	.c ~ .d { color: green; }
	.a ~ .d { color: green; }

	/* no match */
	.b ~ .c { color: green; }
</style>

<div class="a" />

{#each array as item}
	<div class="b" />
{:else}
	<div class="c" />
{/each}

<div class="d" />
