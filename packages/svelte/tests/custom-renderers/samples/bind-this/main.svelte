<script lang="ts">
	let p = $state<any>(null);
	let div = $state<any>(null);
	let show = $state(true);
	let items = $state(['a', 'b']);
	let refs: any[] = $state([]);
	let tag = $state('section');
	let dynamic = $state<any>(null);
	let functional = $state<any>(null);
</script>

{#if show}
	<div bind:this={div}>hello</div>
	<i bind:this={() => functional, (v) => (functional = v)}>functional</i>
{/if}

{#each items as item, i}
	<span bind:this={refs[i]}>{item}</span>
{/each}

<p bind:this={p}>p</p>

<svelte:element this={tag} bind:this={dynamic}>dynamic</svelte:element>

<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => items.pop()}>pop</button>
<button onclick={() => (tag = tag === 'section' ? 'article' : 'section')}>tag</button>
<output
	>{p?.name}|{div?.name ?? 'null'}|{refs
		.filter(Boolean)
		.map((r) => r.children[0].value)
		.join(',')}|{dynamic?.name}|{functional?.name ?? 'null'}</output
>
