<script>
	import Nested from './Nested.svelte';

</script>

<Nested let:thing>
	<svelte:fragment slot="thing"><span>{thing}</span></svelte:fragment>
</Nested>