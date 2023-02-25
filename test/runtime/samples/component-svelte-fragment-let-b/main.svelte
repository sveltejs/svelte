<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<svelte:fragment slot="main">
		<span>{count}</span>
	</svelte:fragment>
</Nested>