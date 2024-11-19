<script>
	import Nested from './Nested.svelte';
	let ignored;
</script>

<svelte:html foo="foo" onevent={ignored}></svelte:html>

<Nested/>
