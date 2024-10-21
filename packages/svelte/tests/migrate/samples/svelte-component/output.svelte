<script>
	/** @type {{ [key: string]: any }} */
	let { ...rest } = $props();
	let Component;
	let fallback;

	const SvelteComponent_10 = $derived(Math.random() > .5 ? rest.heads : rest.tail);
</script>

<Component >
	{#snippet children({ Comp })}
		<Comp />
	{/snippet}
</Component>

<Component >
	{#snippet children({ comp })}
		{@const SvelteComponent = comp}
	<SvelteComponent />
	{/snippet}
</Component>

<Component >
	{#snippet children({ comp: stuff })}
		{@const SvelteComponent_1 = stuff}
	<SvelteComponent_1 />
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
		{@const SvelteComponent_2 = stuff}
	<div  >
			<SvelteComponent_2 />
		</div>
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
	{@const SvelteComponent_3 = stuff}
	
			<SvelteComponent_3 />
		
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
		{@const SvelteComponent_4 = stuff}
	<svelte:element this={"div"}  >
			<SvelteComponent_4 />
		</svelte:element>
	{/snippet}
</Component>

<Component >
	{#snippet children({ Comp })}
		<Comp />
	{/snippet}
</Component>

<Component >
	{#snippet children({ comp })}
		{@const SvelteComponent_5 = comp}
	<SvelteComponent_5 />
	{/snippet}
</Component>

<Component >
	{#snippet children({ comp: stuff })}
		{@const SvelteComponent_6 = stuff}
	<SvelteComponent_6 />
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
		{@const SvelteComponent_7 = stuff}
	<div  >
			<SvelteComponent_7 />
		</div>
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
	{@const SvelteComponent_8 = stuff}
	
			<SvelteComponent_8 />
		
	{/snippet}
</Component>

<Component>
	{#snippet x({ comp: stuff })}
		{@const SvelteComponent_9 = stuff}
	<svelte:element this={"div"}  >
			<SvelteComponent_9 />
		</svelte:element>
	{/snippet}
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

<Component>
	{@const stuff = true}
	{@const SvelteComponent_18 = stuff && Component}
	<div>
		<p>
			<SvelteComponent_18 />
		</p>
	</div>
</Component>

<Component>
	{@const stuff = true}
	{@const SvelteComponent_19 = stuff && Component}
	<div>
		<p>
			<SvelteComponent_19 />
		</p>
	</div>
</Component>

{#each [] as i}
	{@const stuff = true}
	{@const SvelteComponent_20 = stuff && Component}
	<li>
		<SvelteComponent_20 />
	</li>
{/each}

{#await stuff}
	{@const stuff = true}
	{@const SvelteComponent_21 = stuff && Component}
	<li>
		<SvelteComponent_21 />
	</li>
{:then x}
	{@const stuff = true}
	{@const SvelteComponent_22 = stuff && Component}
	<li>
		<SvelteComponent_22 />
	</li>
{:catch e}
	{@const stuff = true}
	{@const SvelteComponent_23 = stuff && Component}
	<li>
		<SvelteComponent_23 />
	</li>
{/await}

{#await stuff then x}
	{@const stuff = true}
	{@const SvelteComponent_24 = stuff && Component}
	<li>
		<SvelteComponent_24 />
	</li>
{:catch e}
	{@const stuff = true}
	{@const SvelteComponent_25 = stuff && Component}
	<li>
		<SvelteComponent_25 />
	</li>
{/await}

{#if true}
	{@const stuff = true}
	{@const SvelteComponent_26 = stuff && Component}
	<li>
		<SvelteComponent_26 />
	</li>
{/if}

{#snippet test()}
	{@const stuff = true}
	{@const SvelteComponent_27 = stuff && Component}
	<li>
		<SvelteComponent_27 />
	</li>
{/snippet}

<Component>
	<Nested>
		{@const SvelteComponent_28 = stuff && Component}
		<SvelteComponent_28 />
	</Nested>
</Component>