<script>
	let attrs = $state({ draggable: 'false', spellcheck: 'false', translate: 'no' });
</script>

<svelte:element this={'div'} draggable="false" spellcheck="false" translate="no"></svelte:element>

<div {...attrs}></div>
