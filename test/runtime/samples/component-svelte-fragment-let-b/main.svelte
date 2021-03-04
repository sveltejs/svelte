<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="main" let:count>
		<span>{count}</span>
	</svelte:fragment>
</Nested>