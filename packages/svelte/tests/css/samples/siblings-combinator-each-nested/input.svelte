<script>
	let array = [1];
</script>

<style>
	/* boundary of each */
	.a + .d { color: green; }
	.a + .e { color: green; }
	.a + .f { color: green; }
	.a + .g { color: green; }
	.c + .d { color: green; }
	.c + .e { color: green; }
	.c + .f { color: green; }
	.c + .g { color: green; }

	/* nested boundary of each */
	.j + .m { color: green; }
	.j + .n { color: green; }
	.j + .o { color: green; }
	.k + .m { color: green; }
	.k + .n { color: green; }
	.k + .o { color: green; }
	.l + .m { color: green; }
	.l + .n { color: green; }
	.l + .o { color: green; }

	/* parent each */
	.d + .e { color: green; }
	.e + .f { color: green; }

	/* child each */
	.g + .h { color: green; }

	/* wrap around */
	.f + .d { color: green; }
	.f + .e { color: green; }
	.f + .f { color: green; }

	.h + .g { color: green; }
	.i + .h { color: green; }
	.i + .g { color: green; }

	/* wrap around self */
	.d + .d { color: green; }
	.e + .e { color: green; }
	.f + .f { color: green; }
	.g + .g { color: green; }
	.h + .h { color: green; }
	.i + .i { color: green; }

	/* wrap around self + next */
	.e + .e + .f { color: green; }
	.e + .e + .d { color: green; }
	.h + .h + .i { color: green; }
	.h + .h + .g { color: green; }

	/* no match */
	.a + .h { color: green; }
	.a + .i { color: green; }
	.c + .h { color: green; }
	.c + .i { color: green; }
	.d + .f { color: green; }
	.d + .g { color: green; }
	.e + .g { color: green; }
	.g + .i { color: green; }
</style>

<div class="a"></div>

{#each array as item}
	<div class="b"></div>
	<div class="c"></div>
{/each}

{#each array as item}
	{#each array as item}
		{#each array as item}
			<div class="d"></div>
		{/each}
		<div class="e"></div>
	{/each}
	<div class="f"></div>
{/each}

{#each array as item}
	<div class="g"></div>
	{#each array as item}
		<div class="h"></div>
		{#each array as item}
			<div class="i"></div>
		{/each}
	{/each}
{/each}

{#each array as item}
	<div class="j"></div>
	{#each array as item}
		<div class="k"></div>
		{#each array as item}
			<div class="l"></div>
		{/each}
	{/each}
{/each}

{#each array as item}
	{#each array as item}
		{#each array as item}
			<div class="m"></div>
		{/each}
		<div class="n"></div>
	{/each}
	<div class="o"></div>
{/each}
