<script>
	let array = [];
</script>

<style>
	.a ~ .e { color: green; }
	.a ~ .f { color: green; }
	.b ~ .c { color: green; }
	.b ~ .d { color: green; }
	.c ~ .e { color: green; }
	.c ~ .f { color: green; }
	.d ~ .e { color: green; }
	.d ~ .f { color: green; }
	.e ~ .e { color: green; }
	.i ~ .j { color: green; }
	.g ~ .h ~ .j { color: green; }
	.g ~ .i ~ .j { color: green; }
	.m ~ .m { color: green; }
	.m ~ .l { color: green; }
	.l ~ .m { color: green; }
	.a ~ .c { color: green; }
	.a ~ .g { color: green; }
	.b ~ .e { color: green; }
	.c ~ .g { color: green; }
	.c ~ .k { color: green; }
	.d ~ .d { color: green; }
	.g ~ .g { color: green; }
	.h ~ .h { color: green; }
	.i ~ .i { color: green; }
	.j ~ .j { color: green; }
	.g ~ .j { color: green; }
	.g ~ .h ~ .i ~ .j { color: green; }

	/* no match */
	.e ~ .f { color: green; }
</style>

<div class="a"></div>

{#each array as a}
	<div class="b"></div>
	{#each array as b}
		<div class="c"></div>
	{:else}
		<div class="d"></div>
	{/each}
{/each}

{#each array as c}
	{#each array as d}
		<div class="e"></div>
	{/each}
{:else}
	<div class="f"></div>
{/each}

{#each array as x}
	<div class="g"></div>
	{#each array as y}
		{#each array as z}
			<div class="h"></div>
		{/each}
	{:else}
		<div class="i"></div>
	{/each}
	<div class="j"></div>
{/each}

<div class="k"></div>

{#each array as item}
	{#each array as item}
		<div class="l"></div>
	{:else}
		<div class="m"></div>
	{/each}
{/each}
