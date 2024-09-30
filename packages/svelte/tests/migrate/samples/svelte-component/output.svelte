<script>
	/** @type {{Record<string, any>}} */
	let { ...rest } = $props();
	let Component;
	let fallback;

	const SvelteComponent_10 = $derived(Math.random() > .5 ? rest.heads : rest.tail);
</script>

<Component let:Comp>
	<Comp />
</Component>

<Component let:comp>
	{@const SvelteComponent = comp}
	<SvelteComponent />
</Component>

<Component let:comp={stuff}>
	{@const SvelteComponent_1 = stuff}
	<SvelteComponent_1 />
</Component>

<Component>
	<div slot="x" let:comp={stuff}>
		{@const SvelteComponent_2 = stuff}
		<SvelteComponent_2 />
	</div>
</Component>

<Component>
	<svelte:fragment slot="x" let:comp={stuff}>
		{@const SvelteComponent_3 = stuff}
		<SvelteComponent_3 />
	</svelte:fragment>
</Component>

<Component>
	<svelte:element this={"div"} slot="x" let:comp={stuff}>
		{@const SvelteComponent_4 = stuff}
		<SvelteComponent_4 />
	</svelte:element>
</Component>

<Component let:Comp>
	<Comp />
</Component>

<Component let:comp>
	{@const SvelteComponent_5 = comp}
	<SvelteComponent_5 />
</Component>

<Component let:comp={stuff}>
	{@const SvelteComponent_6 = stuff}
	<SvelteComponent_6 />
</Component>

<Component>
	<div slot="x" let:comp={stuff}>
		{@const SvelteComponent_7 = stuff}
		<SvelteComponent_7 />
	</div>
</Component>

<Component>
	<svelte:fragment slot="x" let:comp={stuff}>
		{@const SvelteComponent_8 = stuff}
		<SvelteComponent_8 />
	</svelte:fragment>
</Component>

<Component>
	<svelte:element this={"div"} slot="x" let:comp={stuff}>
		{@const SvelteComponent_9 = stuff}
		<SvelteComponent_9 />
	</svelte:element>
</Component>

<Component />
<Component prop value="" on:click on:click={()=>''} />
<SvelteComponent_10  prop value="" on:click on:click={()=>''}/>

<Component 
	prop value="" 
	on:click 
	on:click={()=>''} 
/>

<SvelteComponent_10
	prop value="" 
	on:click 
	on:click={()=>''}
/>

{#if true}
	{@const x = {Component}}
	{@const SvelteComponent_12 = x['Component']}
	<SvelteComponent_12 />
{/if}

{#if true}
	{@const x = {Component}}
	<x.Component />
{/if}

{#each [] as component}
	{@const SvelteComponent_13 = component}
	<SvelteComponent_13 />
{/each}

{#each [] as Component}
	<Component />
{/each}

{#each [] as component}
	{@const Comp = component.component}
	<Comp />
{/each}

{#each [] as component}
	{@const comp = component.component}
	{@const SvelteComponent_14 = comp}
	<SvelteComponent_14 />
{/each}

{#await Promise.resolve()}
	<Component />
	{@const SvelteComponent_15 = fallback}
	<SvelteComponent_15 />
{:then something}
	{@const SvelteComponent_16 = something}
	<SvelteComponent_16 />
{:catch e}
	{@const SvelteComponent_17 = e}
	<SvelteComponent_17 />
{/await}

{#await Promise.resolve() then Something}
	<Something />
{:catch Error}
	<Error />
{/await}