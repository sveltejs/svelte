<script>
	import Component from './Component.svelte';
</script>

<span id="attr" title="A&#x0A;B"></span>
<span id="attr-decimal" title="A&#10;B"></span>
<span id="attr-other-entity" title="&copy;"></span>

<Component text="A&#x0A;B" />
