<script>
	
	/** @type {{readonly: Record<string, { href: string; title: string; }[]>, optional?: string, binding: any, bindingOptional?: string}} */
	let {
		readonly,
		optional = 'foo',
		binding = $bindable(),
		bindingOptional = $bindable('bar')
	} = $props();
</script>

{readonly}
{optional}
<input bind:value={binding} />
<input bind:value={bindingOptional} />