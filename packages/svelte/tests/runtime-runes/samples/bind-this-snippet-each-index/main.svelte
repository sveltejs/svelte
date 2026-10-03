<script>
	let ids = $state(['a', 'b', 'c']);
	let plain = $state([]);
	let in_snippet = $state([]);
	let in_snippet_destructured = $state([]);

	/** @param {Array<HTMLElement | null>} nodes */
	const text = (nodes) => nodes.map((node) => node?.textContent ?? 'null').join(',');
</script>

{#snippet item(id, index)}
	<span bind:this={in_snippet[index]}>{id}</span>
{/snippet}

{#snippet destructured({ id, index })}
	<i bind:this={in_snippet_destructured[index]}>{id}</i>
{/snippet}

{#each ids as id, index (id)}
	<b bind:this={plain[index]}>{id}</b>
	{@render item(id, index)}
	{@render destructured({ id, index })}
{/each}

<button onclick={() => ids.splice(1, 1)}>remove</button>
<p>{text(plain)} | {text(in_snippet)} | {text(in_snippet_destructured)}</p>
