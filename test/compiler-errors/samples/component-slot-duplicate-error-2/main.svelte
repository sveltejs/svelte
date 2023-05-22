<script>
	import Nested from './irrelevant';
</script>

<Nested>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
</Nested>