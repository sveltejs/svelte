<script>
	/** @type {{readonly: any, optional?: string}} */
	let { readonly, optional = 'foo' } = $props();
	let writable = $derived(!readonly);
</script>

{readonly} {optional} {writable}