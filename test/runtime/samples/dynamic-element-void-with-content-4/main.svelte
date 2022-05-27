<script>
	import Nested from './Nested.svelte';
	export let tag;
</script>

<svelte:element this='{tag}'><Nested/></svelte:element>
