<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="default">value</svelte:fragment>
	<p>value</p>
</Nested>