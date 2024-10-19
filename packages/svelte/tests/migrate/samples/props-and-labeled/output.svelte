<script>
	/**
	 * @typedef {Object} Props
	 * @property {any} readonly
	 * @property {string} [optional]
	 */

	/** @type {Props} */
	let { readonly, optional = 'foo' } = $props();
	let writable = $derived(!readonly);
</script>

{readonly} {optional} {writable}