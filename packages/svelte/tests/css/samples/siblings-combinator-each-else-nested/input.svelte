<script>
	let array = [];
</script>

<style>
	.a + .e { color: green; }
	.a + .f { color: green; }
	.b + .c { color: green; }
	.b + .d { color: green; }
	.c + .e { color: green; }
	.c + .f { color: green; }
	.d + .e { color: green; }
	.d + .f { color: green; }
	.e + .e { color: green; }
	.i + .j { color: green; }
	.g + .h + .j { color: green; }
	.g + .i + .j { color: green; }
	.m + .m { color: green; }
	.m + .l { color: green; }
	.l + .m { color: green; }

	/* no match */
	.a + .c { color: green; }
	.a + .g { color: green; }
	.b + .e { color: green; }
	.c + .g { color: green; }
	.c + .k { color: green; }
	.d + .d { color: green; }
	.e + .f { color: green; }
	.f + .f { color: green; }
	.g + .j { color: green; }
	.g + .h + .i + .j { color: green; }
</style>

<div class="a" />

{#each array as a}
	<div class="b" />
	{#each array as b}
		<div class="c" />
	{:else}
		<div class="d" />
	{/each}
{/each}

{#each array as c}
	{#each array as d}
		<div class="e" />
	{/each}
{:else}
	<div class="f" />
{/each}

{#each array as item}
	<div class="g" />
	{#each array as item}
		{#each array as item}
			<div class="h" />
		{/each}
	{:else}
		<div class="i" />
	{/each}
	<div class="j" />
{/each}

<div class="k" />

{#each array as item}
	{#each array as item}
		<div class="l" />
	{:else}
		<div class="m" />
	{/each}
{/each}
