<svelte:options tag="custom-element"/>

<script>
import './AsElement.svelte';
import ImportedElement from './AsImported.svelte';
</script>

<as-element>Hello</as-element>
<ImportedElement>world</ImportedElement>