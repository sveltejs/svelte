<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:thing>
	<span>{thing}</span>
	<svelte:fragment slot="thing" let:thing><span>{thing}</span></svelte:fragment>
</Nested>