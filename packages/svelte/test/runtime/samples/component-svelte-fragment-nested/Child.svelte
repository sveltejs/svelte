<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="name">
		<slot />
	</svelte:fragment>
</Nested>

<Nested>
	<svelte:fragment slot="name">
		<slot name="b" />
	</svelte:fragment>
</Nested>