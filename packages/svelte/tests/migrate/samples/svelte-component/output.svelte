<script>
	/** @type {{Record<string, any>}} */
	let { ...rest } = $props();
	let Component;
	let fallback;

	const SvelteComponent_5 = $derived(Math.random() > .5 ? rest.heads : rest.tail);
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

<Component />
<Component prop value="" on:click on:click={()=>''} />
<SvelteComponent_5  prop value="" on:click on:click={()=>''}/>

<Component 
	prop value="" 
	on:click 
	on:click={()=>''} 
/>

<SvelteComponent_5
	prop value="" 
	on:click 
	on:click={()=>''}
/>

{#if true}
	{@const x = {Component}}
	{@const SvelteComponent_7 = x['Component']}
	<SvelteComponent_7 />
{/if}

{#if true}
	{@const x = {Component}}
	<x.Component />
{/if}

{#each [] as component}
	{@const SvelteComponent_8 = component}
	<SvelteComponent_8 />
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
	{@const SvelteComponent_9 = comp}
	<SvelteComponent_9 />
{/each}

{#await Promise.resolve()}
	{@const SvelteComponent_10 = fallback}
	<Component />
	<SvelteComponent_10 />
{:then something}
	{@const SvelteComponent_11 = something}
	<SvelteComponent_11 />
{:catch e}
	{@const SvelteComponent_12 = e}
	<SvelteComponent_12 />
{/await}

{#await Promise.resolve() then Something}
	<Something />
{:catch Error}
	<Error />
{/await}