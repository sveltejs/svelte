<script>
	import Nested from "./Nested.svelte";
	import B from './B.svelte';
	const a = 'a';
</script>
<Nested>
	<svelte:fragment slot="a">
		content <span>{ a }</span>
	</svelte:fragment>
	<svelte:fragment slot="b">
		<B name="world" />
	</svelte:fragment>
</Nested>
