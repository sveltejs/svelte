<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
	<p slot="foo">{value}</p>
</Nested>