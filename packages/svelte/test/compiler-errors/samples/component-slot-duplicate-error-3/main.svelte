<script>
	import Nested from './irrelevant';
</script>

<Nested>
	<svelte:fragment slot="foo">{value}</svelte:fragment>
	<p slot="foo">{value}</p>
</Nested>