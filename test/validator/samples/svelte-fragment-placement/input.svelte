<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<div>
		<svelte:fragment>
			<div>test</div>
		</svelte:fragment>
	</div>
</Nested>