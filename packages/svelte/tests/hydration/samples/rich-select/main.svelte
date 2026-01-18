<script>
	let items = [1, 2, 3];
	let show = true;
	let html = '<option>From HTML</option>';

	import Option from './Option.svelte';
</script>

<!-- select with rich option (has span inside) - SHOULD use customizable_select_element -->
<select>
	<option><span>Rich</span></option>
</select>

<!-- select with each containing plain options - should NOT use customizable_select_element -->
<select>
	{#each items as item}
		<option>{item}</option>
	{/each}
</select>

<!-- select with if containing plain options - should NOT use customizable_select_element -->
<select>
	{#if show}
		<option>Visible</option>
	{/if}
</select>

<!-- select with key containing plain options - should NOT use customizable_select_element -->
<select>
	{#key items}
		<option>Keyed</option>
	{/key}
</select>

<!-- select with snippet defined at top level and rendered - should NOT use customizable_select_element -->
{#snippet opt()}
	<option>Snippet</option>
{/snippet}
<select>
	{@render opt()}
</select>

<!-- select with const inside each (should be ignored) - should NOT use customizable_select_element -->
<select>
	{#each items as item}
		{@const x = item * 2}
		<option>{x}</option>
	{/each}
</select>

<!-- optgroup with rich option - SHOULD use customizable_select_element -->
<select>
	<optgroup label="Group">
		<option><strong>Bold</strong></option>
	</optgroup>
</select>

<!-- optgroup with each containing plain options - should NOT use customizable_select_element -->
<select>
	<optgroup label="Group">
		{#each items as item}
			<option>{item}</option>
		{/each}
	</optgroup>
</select>

<!-- option with rich content (span) - SHOULD use customizable_select_element -->
<select>
	<option value="a"><em>Italic</em> text</option>
</select>

<!-- nested: select > each > option with rich content - SHOULD use customizable_select_element on option -->
<select>
	{#each items as item}
		<option><span>{item}</span></option>
	{/each}
</select>

<!-- nested: select > if > each > plain options - should NOT use customizable_select_element -->
<select>
	{#if show}
		{#each items as item}
			<option>{item}</option>
		{/each}
	{/if}
</select>

<!-- select with svelte:boundary containing plain options - should NOT use customizable_select_element -->
<select>
	<svelte:boundary>
		<option>Boundary</option>
	</svelte:boundary>
</select>

<!-- select with svelte:boundary containing rich options - SHOULD use customizable_select_element on option -->
<select>
	<svelte:boundary>
		<option><span>Rich in boundary</span></option>
	</svelte:boundary>
</select>

<!-- select with Component - SHOULD be treated as rich content -->
<select>
	<Option />
</select>

<!-- select with @render snippet - SHOULD be treated as rich content -->
{#snippet option_snippet()}
	<option>Rendered</option>
{/snippet}
<select>
	{@render option_snippet()}
</select>

<!-- select with @html - SHOULD be treated as rich content -->
<select>
	{@html html}
</select>

<!-- optgroup with Component - SHOULD be treated as rich content -->
<select>
	<optgroup label="Group">
		<Option />
	</optgroup>
</select>

<!-- optgroup with @render - SHOULD be treated as rich content -->
{#snippet option_snippet2()}
	<option>Rendered in group</option>
{/snippet}
<select>
	<optgroup label="Group">
		{@render option_snippet2()}
	</optgroup>
</select>

<!-- option with @html inside - SHOULD use customizable_select_element -->
<select>
	<option>{@html '<strong>Bold HTML</strong>'}</option>
</select>

<!-- each block inside select with Component - SHOULD be treated as rich -->
<select>
	{#each items as item}
		<Option />
	{/each}
</select>

<!-- if block inside select with @render - SHOULD be treated as rich -->
{#snippet conditional_option()}
	<option>Conditional</option>
{/snippet}
<select>
	{#if show}
		{@render conditional_option()}
	{/if}
</select>

<!-- select with button/selectedcontent and static options - SHOULD use customizable_select_element -->
<select>
	<button><selectedcontent></selectedcontent></button>
	<option>cool</option>
	<option>cooler</option>
	<option>coolerone</option>
</select>

<!-- select with button/selectedcontent and dynamic options - SHOULD use customizable_select_element -->
<select>
	<button><selectedcontent></selectedcontent></button>
	{#each items as item}
		<option>{item}</option>
	{/each}
</select>
