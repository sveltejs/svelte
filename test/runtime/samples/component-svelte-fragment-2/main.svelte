<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	<svelte:fragment slot="name">
		<span>Hello</span>
	</svelte:fragment>
</Nested>

<Nested>
	<svelte:fragment slot="name">
		<span>world</span>
	</svelte:fragment>
</Nested>