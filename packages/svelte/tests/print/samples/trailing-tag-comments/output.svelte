<svelte:options customElement={{ tag: "foo-bar" } /* option */} /><script>
	const c = 1; // script comment
</script>

{a /* c */}{b}
{a /* one */ /* two */}{b}
{a // line
}{b}
{a /* multi
line */}{b}
{a /* inner */ /* outer */}{b}
{a + /* interior */ b /* trailing */}{b}
{foo(a) /* call one */ /* call two */}{b}
{foo(foo(a)) // nested call
}{b}

{#if x}
	{@const a = foo(b) /* const call one */ /* const call two */}{@const c = 2}
{/if}

<div foo={foo(a) /* attribute call */} bar={b}></div>

{#if x}
	{@const a = 1 /* c */}{@const b = 2}
{/if}

{#if x}
	{@const a = 1 // line
	}{@const b = 2}
{/if}

{#if x}
	{const a = (1 /* c */)}{const b = 2}
{/if}

{#if x}
	{const a = (1 /* one */ /* two */)}{const b = 2}
{/if}

{#if x}
	{const a = (1 /* one */),
		/* separator */ b = (2 /* two */ // line
		)}{const c = 3}
{/if}

{@html a /* html */}{b}
{@render foo() /* render */}{b}

<input
	{@attach a /* attach */}
	value={a /* value */}
	{...a /* spread */}
/>

<div
	title="{a /* first */}{b /* second */}"
	style:color={a /* style */}
></div>

<input bind:value={a /* bind */} />
<input bind:value={value /* bind shorthand */} foo={b} />

<div
	class:active={active /* class shorthand */}
	foo={b}
></div>

<Component let:value={value /* let shorthand */} foo={b} />
<input bind:value={/* leading shorthand */ value} foo={b} />
<input bind:value={get, /* get */ set /* set */} />

<button
	on:click={a /* on */}
	use:action={a /* use */}
	transition:fade={a /* transition */}
	animate:flip={a /* animate */}
	class:active={a /* class */}
></button>

<Component let:value={a /* let */} />
<svelte:component this={A /* component */} foo={b} />
<svelte:element this={a /* element */} foo={b} />

{#if a /* if */}
	{b}
{:else if a /* elseif */}
	{b}
{/if}

{#key a /* key */}
	{b}
{/key}

{#each a /* expression */ as item (item /* key */)}
	{b}
{/each}

{#await a /* pending */}
	{b}
{:then value}
	{b}
{:catch error}
	{b}
{/await}

{#await a /* await */ then value}
	{b}
{/await}

{#await a /* await */ catch error}
	{b}
{/await}

{#snippet foo(a /* parameter */)}
	{b}
{/snippet}

{#snippet foo(a = foo(b) /* default one */ /* default two */)}
	{b}
{/snippet}

{#snippet foo(a, /* parameter one */ /* parameter two */ b /* last one */ /* last two */)}
	{b}
{/snippet}

{#snippet foo(a, b = (1, 2), /* sequence */ c = 3)}
	{b}
{/snippet}

{#snippet foo( /* no parameters */)}
	{b}
{/snippet}

<Component>
	{#snippet children( /* children */)}
		{b}
	{/snippet}
</Component>

{@debug a, /* debug one */ b /* debug two */}{b}
{foo() /* empty call */}{b}

<button onclick={() => a++ /* arrow */}></button>{b}
{a // line one
// line two
}{b}
{a // line then block
/* block */}{b}

{#if x}
	{@const a = 1 // const line
	/* const block */}{@const b = 2}
{/if}

{#each a.split("" // each line
/* each block */) as item}
	{b}
{/each}

<button
	onclick={() => foo(a // handler line
	/* handler block */)}
></button>{b}

<button
	onclick={() => a = true /* block then line */ // line
	}
></button>{b}
