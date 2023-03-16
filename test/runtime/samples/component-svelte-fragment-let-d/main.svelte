<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="main" let:foo={bar}>
		<p>{bar}</p>
	</svelte:fragment>
</Nested>