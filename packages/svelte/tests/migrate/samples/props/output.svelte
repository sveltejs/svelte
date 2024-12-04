<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {Record<string, { href: string; title: string; }[]>} readonly
	 * @property {string} [optional]
	 * @property {any} binding
	 * @property {string} [bindingOptional]
	 */

	/** @type {Props} */
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