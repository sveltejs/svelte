<script lang="ts">
	let items = $state([1, 2]);
	let tag = $state('section');
	let visible = $state(true);

	function update() {
		items = [...items, items.length + 1];
		tag = tag === 'section' ? 'article' : 'section';
		visible = !visible;
	}
</script>

{#snippet block()}
	{#if visible}<p>visible</p>{:else}<p>hidden</p>{/if}
{/snippet}

<button onclick={update}>update</button>
<ul>{#each items as item (item)}<li>{item}</li>{/each}</ul>
<svelte:element this={tag}><span>inside</span></svelte:element>
<div>{@render block()}</div>
