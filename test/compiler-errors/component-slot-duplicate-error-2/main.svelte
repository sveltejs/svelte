<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
</Nested>