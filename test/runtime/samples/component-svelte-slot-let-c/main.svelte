<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="main" let:c let:count>
		<span>{c} ({count})</span>
	</svelte:fragment>
</Nested>