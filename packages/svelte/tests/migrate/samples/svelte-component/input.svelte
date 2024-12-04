<script>
	let Component;
	let fallback;
</script>

<Component let:Comp>
	<svelte:component this={Comp} />
</Component>

<Component let:comp>
	<svelte:component this={comp} />
</Component>

<Component let:comp={stuff}>
	<svelte:component this={stuff} />
</Component>

<Component>
	<div slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</div>
</Component>

<Component>
	<svelte:fragment slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</svelte:fragment>
</Component>

<Component>
	<svelte:element this={"div"} slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</svelte:element>
</Component>

<svelte:component this={Component} let:Comp>
	<svelte:component this={Comp} />
</svelte:component>

<svelte:component this={Component} let:comp>
	<svelte:component this={comp} />
</svelte:component>

<svelte:component this={Component} let:comp={stuff}>
	<svelte:component this={stuff} />
</svelte:component>

<svelte:component this={Component}>
	<div slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</div>
</svelte:component>

<svelte:component this={Component}>
	<svelte:fragment slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</svelte:fragment>
</svelte:component>

<svelte:component this={Component}>
	<svelte:element this={"div"} slot="x" let:comp={stuff}>
		<svelte:component this={stuff} />
	</svelte:element>
</svelte:component>

<svelte:component this={Component} />
<svelte:component this={Component} prop value="" on:click on:click={()=>''} />
<svelte:component this={Math.random() > .5 ? $$restProps.heads : $$restProps.tail}  prop value="" on:click on:click={()=>''}/>

<svelte:component 
	this={Component} 
	prop value="" 
	on:click 
	on:click={()=>''} 
/>

<svelte:component 
	this={Math.random() > .5 ? $$restProps.heads : $$restProps.tail}
	prop value="" 
	on:click 
	on:click={()=>''}
/>

{#if true}
	{@const x = {Component}}
	<svelte:component this={x['Component']} />
{/if}

{#if true}
	{@const x = {Component}}
	<svelte:component this={x.Component} />
{/if}

{#each [] as component}
	<svelte:component this={component} />
{/each}

{#each [] as Component}
	<svelte:component this={Component} />
{/each}

{#each [] as component}
	{@const Comp = component.component}
	<svelte:component this={Comp} />
{/each}

{#each [] as component}
	{@const comp = component.component}
	<svelte:component this={comp} />
{/each}

{#await Promise.resolve()}
	<svelte:component this={Component} />
	<svelte:component this={fallback} />
{:then something}
	<svelte:component this={something} />
{:catch e}
	<svelte:component this={e} />
{/await}

{#await Promise.resolve() then Something}
	<svelte:component this={Something} />
{:catch Error}
	<svelte:component this={Error} />
{/await}

<Component>
	{@const stuff = true}
	<div>
		<p>
			<svelte:component this={stuff && Component} />
		</p>
	</div>
</Component>

<svelte:component this={Component}>
	{@const stuff = true}
	<div>
		<p>
			<svelte:component this={stuff && Component} />
		</p>
	</div>
</svelte:component>

{#each [] as i}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{/each}

{#await stuff}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{:then x}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{:catch e}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{/await}

{#await stuff then x}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{:catch e}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{/await}

{#if true}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{/if}

{#snippet test()}
	{@const stuff = true}
	<li>
		<svelte:component this={stuff && Component} />
	</li>
{/snippet}

<Component>
	<Nested>
		<svelte:component this={stuff && Component} />
	</Nested>
</Component>