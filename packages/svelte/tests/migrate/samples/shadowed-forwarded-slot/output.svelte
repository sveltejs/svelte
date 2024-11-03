<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [label]
	 */

	/** @type {Props} */
	let { label } = $props();
	const label_render = $derived(label);

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