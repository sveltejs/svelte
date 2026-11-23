<script>
	/* script */
	let a = 1;
</script>

{a /* c */}{/* lead */ b}
{a // line
}{b}
{a /* c1 */ /* c2 */}{b}

{#if x /* c */}
	{@const a = 1 /* c1 */}{@const b = 2}
{:else if y /* c2 */}
	{@html h /* c3 */}
	{@render r() /* c4 */}
	{@debug a /* c5 */}
{/if}

{#each items as item (item.id /* c */)}
	{item}
{/each}

{#await p /* c */}
	pending
{:then v}
	{v}
{/await}

{#key k /* c */}
	{b}
{/key}

{#snippet s(a /* c */)}
	{a}
{/snippet}

{#snippet empty(/* c */)}
	{b}
{/snippet}

<div
	{...props /* c */}
	foo={a /* c2 */}
	bind:value={v /* c3 */}
	use:act={p /* c4 */}
	{@attach fn /* c5 */}
>{b}</div>

<svelte:component this={C /* c */} />
<svelte:element this={tag /* c */} />
{a /* eof */}
