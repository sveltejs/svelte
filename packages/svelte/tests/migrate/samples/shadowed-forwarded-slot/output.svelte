<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [label]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { label, children } = $props();
	const label_render = $derived(label);
	const children_render = $derived(children);

</script>

{#if label}
	{@render label?.()}
{/if}
<MyInput>
	{#snippet label()}
		{@render label_render?.()}
	{/snippet}
</MyInput>
<MyInput>
	{#snippet label()}
		<div >
			<MyComponent>
				{#snippet label()}
						<div >
						{@render label_render?.()}
					</div>
					{/snippet}
			</MyComponent>
		</div>
	{/snippet}
</MyInput>

<MyInput >
	{#snippet children({ args })}
		{@render children_render?.()}
	{/snippet}
</MyInput>

<MyInput>
	<div >
		{#snippet children({ args })}
				{@render children_render?.()}
					{/snippet}
		</div>
</MyInput>